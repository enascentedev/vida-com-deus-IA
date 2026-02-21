"""ETL de scraping para https://www.wgospel.com/tempoderefletir/

Coleta reflexões diárias e persiste no banco de dados via PostRepository.

Estrutura DOM da listagem (tema BeTheme/WordPress):
  div.post-item
    div.date_label          → data (ex: "21 de fevereiro de 2026")
    div.image_wrapper img   → thumbnail
    h2.entry-title > a      → título + href do post
    div.post-excerpt        → trecho com referência bíblica
    a.post-more             → link "Leia mais"
"""

import re
from datetime import datetime, timezone

import httpx
from bs4 import BeautifulSoup, Tag
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.post_repository import PostRepository

SOURCE_URL = "https://www.wgospel.com/tempoderefletir/"

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0.0.0 Safari/537.36"
    ),
}

_VERSE_REF_RE = re.compile(
    r"((?:[1-3]\s*)?[A-ZÀ-Ú][a-zà-ú]+(?:\s+[a-zà-ú]+)*)"
    r"\s+(\d+[.:]\d+(?:\s*[-–]\s*\d+)?)"
    r"\s*[-–]\s*(.+)",
    re.DOTALL,
)

_PROMO_MARKERS = [
    "Saiba como receber",
    "No celular, instale",
    "Para ver/ouvir no",
    "Tenha os nossos aplicativos",
    "Para receber pelo WhatsApp",
    "Participe do nosso canal",
    "Instagram:",
    "Threads:",
    "X (Antigo Twitter):",
    "Facebook:",
    "PIX",
    "manah@wgospel.com",
]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _is_promo(text: str) -> bool:
    return any(marker in text for marker in _PROMO_MARKERS)


def _parse_excerpt_reference(excerpt: str) -> tuple[str, str]:
    """Extrai referência bíblica e trecho do versículo a partir do excerpt.

    Retorna (reference, verse_snippet). Ex:
      ("Josué 1:29", "Sê forte e corajoso; não temas...")
    """
    cleaned = re.sub(r"TEMPO DE REFLETIR \d+\s*[-–]\s*\d.*?\d{4}\s*", "", excerpt)
    cleaned = cleaned.replace("\xa0", " ").strip()

    match = _VERSE_REF_RE.search(cleaned)
    if match:
        book = match.group(1).strip()
        chapter_verse = match.group(2).strip()
        verse_text = match.group(3).strip().rstrip("[…]").strip()
        return f"{book} {chapter_verse}", verse_text

    return "", cleaned[:200]


def _fetch(url: str, client: httpx.Client) -> httpx.Response | None:
    try:
        resp = client.get(url, headers=_HEADERS, timeout=20, follow_redirects=True)
        resp.raise_for_status()
        return resp
    except httpx.HTTPError:
        return None


def _scrape_post_detail(url: str, client: httpx.Client) -> dict:
    """Acessa a página individual de um post e extrai conteúdo completo."""
    result: dict = {
        "verse_content": "",
        "body_text": "",
        "devotional_prayer": "",
        "audio_url": None,
        "audio_duration": None,
    }

    resp = _fetch(url, client)
    if not resp:
        return result

    soup = BeautifulSoup(resp.text, "html.parser")

    audio_link = soup.find("a", href=re.compile(r"eucompartilho\.com/TempoDeRefletir/", re.I))
    if audio_link:
        result["audio_url"] = audio_link["href"]
        duration_text = audio_link.find_next(string=re.compile(r"Duration:"))
        if duration_text:
            dur_match = re.search(r"Duration:\s*([\d:]+)", str(duration_text))
            if dur_match:
                result["audio_duration"] = dur_match.group(1)

    paragraphs: list[str] = []
    for p in soup.find_all("p"):
        text = p.get_text(separator=" ", strip=True)
        if not text or len(text) < 10:
            continue
        if _is_promo(text):
            continue
        if text.startswith("Podcast:") or text.startswith("Subscribe:"):
            continue
        paragraphs.append(text)

    if not paragraphs:
        return result

    header_idx = -1
    for i, p in enumerate(paragraphs):
        if re.match(r"TEMPO DE REFLETIR \d+", p):
            header_idx = i
            break

    content_paragraphs = paragraphs[header_idx + 1:] if header_idx >= 0 else paragraphs

    if content_paragraphs:
        first = content_paragraphs[0]
        match = _VERSE_REF_RE.search(first)
        if match:
            result["verse_content"] = first
            content_paragraphs = content_paragraphs[1:]

    prayer_idx = -1
    for i, p in enumerate(content_paragraphs):
        if "ore comigo" in p.lower() or "reflita sobre isso" in p.lower():
            prayer_idx = i
            break

    if prayer_idx >= 0:
        body_parts = content_paragraphs[:prayer_idx]
        remaining = content_paragraphs[prayer_idx:]
        for p in remaining:
            if p.startswith(("Pai,", "Senhor,", "Deus,", "Jesus,")):
                result["devotional_prayer"] = p
                break
            if "ore comigo" in p.lower() or "reflita sobre" in p.lower():
                continue
            result["devotional_prayer"] = p
            break
    else:
        body_parts = content_paragraphs

    result["body_text"] = "\n\n".join(body_parts)

    return result


async def run_etl(db: AsyncSession) -> dict:
    """Faz scraping da listagem wgospel.com/tempoderefletir/ e persiste no banco.

    Retorna dict com status da execução.
    """
    started_at = _now_iso()
    repo = PostRepository(db)

    with httpx.Client() as client:
        resp = _fetch(SOURCE_URL, client)
        if not resp:
            return {
                "status": "failed",
                "error": f"Falha ao acessar {SOURCE_URL}",
                "started_at": started_at,
                "finished_at": _now_iso(),
                "posts_collected": 0,
            }

        soup = BeautifulSoup(resp.text, "html.parser")
        post_items = soup.select("div.post-item")

        if not post_items:
            post_items = soup.select("[class*='post'][class*='type-post']")

        posts_collected = 0
        new_posts = 0

        for item in post_items[:20]:
            if not isinstance(item, Tag):
                continue

            date_el = item.select_one("div.date_label")
            title_el = item.select_one("h2.entry-title a") or item.select_one("h2 a")
            excerpt_el = item.select_one("div.post-excerpt")

            if not title_el:
                continue

            title = title_el.get_text(strip=True)
            href = title_el.get("href", "")
            if not title or not href:
                continue

            date_text = date_el.get_text(strip=True) if date_el else ""
            excerpt_text = excerpt_el.get_text(separator=" ", strip=True) if excerpt_el else ""

            img_el = item.select_one("div.image_wrapper img")
            thumbnail_url = None
            if img_el:
                thumbnail_url = (
                    img_el.get("src")
                    or img_el.get("data-src")
                    or img_el.get("data-lazy-src")
                )
                if thumbnail_url and not thumbnail_url.startswith("http"):
                    thumbnail_url = "https://www.wgospel.com" + thumbnail_url

            reference, verse_snippet = _parse_excerpt_reference(excerpt_text)

            detail = _scrape_post_detail(str(href), client)

            verse_content = detail["verse_content"] or verse_snippet
            body_text = detail["body_text"] or ""
            prayer = detail["devotional_prayer"] or ""

            first_paragraph = body_text.split("\n\n")[0] if body_text else ""
            ai_summary = first_paragraph
            meditation = body_text or "Reflita sobre esta passagem ao longo do dia."

            post_data = {
                "title": title,
                "reference": reference,
                "category": "Tempo de Refletir",
                "date": date_text,
                "thumbnail_url": thumbnail_url,
                "source_url": str(href),
                "verse_content": verse_content,
                "body_text": body_text,
                "ai_summary": ai_summary,
                "devotional_meditation": meditation,
                "devotional_prayer": prayer or "Senhor, obrigado pela Tua palavra. Amém.",
                "audio_url": detail.get("audio_url"),
                "audio_duration": detail.get("audio_duration"),
                "tags": ["Reflexão", "Devocional"],
            }

            _, criado = await repo.upsert(post_data)
            posts_collected += 1
            if criado:
                new_posts += 1

    return {
        "status": "success" if posts_collected else "warning",
        "started_at": started_at,
        "finished_at": _now_iso(),
        "posts_collected": posts_collected,
        "new_posts": new_posts,
        "message": (
            f"{posts_collected} reflexões coletadas ({new_posts} novas) de {SOURCE_URL}"
            if posts_collected
            else "Nenhuma reflexão encontrada — verifique a estrutura da página."
        ),
    }
