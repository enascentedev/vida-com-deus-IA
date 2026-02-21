"""ETL de scraping para https://www.wgospel.com/tempoderefletir/

Coleta reflexões diárias e salva em data/posts.json.

Estrutura DOM da listagem (tema BeTheme/WordPress):
  div.post-item
    div.date_label          → data (ex: "21 de fevereiro de 2026")
    div.image_wrapper img   → thumbnail
    h2.entry-title > a      → título + href do post
    div.post-excerpt        → trecho com referência bíblica
    a.post-more             → link "Leia mais"
"""

import re
import uuid
from datetime import datetime, timezone

import httpx
from bs4 import BeautifulSoup, Tag

from app.core.storage import read_json, write_json

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


def scrape_reflexoes() -> dict:
    """Faz scraping da listagem wgospel.com/tempoderefletir/ e de cada post individual.

    Salva os posts coletados em data/posts.json (merge com existentes).
    Retorna dict com status da execução.
    """
    started_at = _now_iso()

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

        posts: list[dict] = []

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
            post_id = f"post-{uuid.uuid5(uuid.NAMESPACE_URL, str(href)).hex[:8]}"

            detail = _scrape_post_detail(str(href), client)

            verse_content = detail["verse_content"] or verse_snippet
            body_text = detail["body_text"] or ""
            prayer = detail["devotional_prayer"] or ""

            first_paragraph = body_text.split("\n\n")[0] if body_text else ""
            ai_summary = first_paragraph
            meditation = body_text or "Reflita sobre esta passagem ao longo do dia."

            key_points: list[str] = []
            if body_text:
                sentences = re.split(r"(?<=[.!?])\s+", body_text)
                key_points = [s for s in sentences[:5] if 20 < len(s) < 200][:3]

            posts.append({
                "id": post_id,
                "title": title,
                "reference": reference,
                "category": "Tempo de Refletir",
                "date": date_text,
                "thumbnail_url": thumbnail_url,
                "source_url": str(href),
                "is_new": True,
                "is_starred": False,
                "tags": ["Reflexão", "Devocional"],
                "verse_content": verse_content,
                "body_text": body_text,
                "ai_summary": ai_summary,
                "key_points": key_points,
                "devotional_meditation": meditation,
                "devotional_prayer": prayer or "Senhor, obrigado pela Tua palavra. Amém.",
                "audio_url": detail.get("audio_url"),
                "audio_duration": detail.get("audio_duration"),
                "collected_at": _now_iso(),
            })

        existing = read_json("posts.json")
        existing_list = existing if isinstance(existing, list) else []
        existing_ids = {p["id"] for p in existing_list if isinstance(p, dict)}

        new_posts = [p for p in posts if p["id"] not in existing_ids]
        merged = posts + [p for p in existing_list if p["id"] not in {pp["id"] for pp in posts}]

        if merged:
            write_json("posts.json", merged)

    return {
        "status": "success" if posts else "warning",
        "started_at": started_at,
        "finished_at": _now_iso(),
        "posts_collected": len(posts),
        "new_posts": len(new_posts),
        "message": (
            f"{len(posts)} reflexões coletadas ({len(new_posts)} novas) de {SOURCE_URL}"
            if posts
            else "Nenhuma reflexão encontrada — verifique a estrutura da página."
        ),
    }
