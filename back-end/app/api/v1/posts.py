from fastapi import APIRouter, Depends, HTTPException

from app.core.dependencies import get_current_user_id
from app.core.storage import read_json
from app.domain.posts.schemas import AudioResponse, FeedResponse, PostDetail, PostKeyPoint, PostSummary

router = APIRouter(prefix="/posts", tags=["Posts"])

# ── Posts mock (fallback quando posts.json não existe) ────────────────────────

MOCK_POST_OF_DAY = PostSummary(
    id="post-001",
    title="Encontrando Paz no Meio do Caos",
    reference="Salmos 23:1",
    category="Post do Dia",
    date="24 de Maio, 2024",
    thumbnail_url="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop",
    is_new=True,
    tags=["Paz", "Fé", "Salmos"],
)

MOCK_RECENT_POSTS = [
    PostSummary(
        id="post-002",
        title="A Força na Fraqueza",
        reference="2 Coríntios 12:9",
        category="Reflexão Diária",
        date="Há 2 horas",
        thumbnail_url="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=225&fit=crop",
        is_new=True,
        tags=["Força", "Graça"],
    ),
    PostSummary(
        id="post-003",
        title="O Propósito no Deserto",
        reference="Êxodo 3:1-10",
        category="Série Moisés",
        date="Ontem",
        thumbnail_url="https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&h=225&fit=crop",
        is_starred=True,
        tags=["Propósito", "Chamado"],
    ),
]

MOCK_POST_DETAIL = PostDetail(
    id="post-001",
    title="João 3:16 — O Amor de Deus",
    reference="João 3:16, NVI",
    category="Novo Testamento",
    date="24 de junho, 2024",
    thumbnail_url="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop",
    verse_content=(
        "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, "
        "para que todo aquele que nele crê não pereça, mas tenha a vida eterna."
    ),
    ai_summary=(
        "Este versículo encapsula o núcleo da fé cristã: o amor de Deus pelo mundo "
        "é tão grande que ele enviou seu Filho para oferecer salvação e vida eterna "
        "a todos que creem nele. É uma declaração de esperança e redenção universal."
    ),
    key_points=[
        PostKeyPoint(text="O amor de Deus é incondicional e abrange toda a humanidade"),
        PostKeyPoint(text="A fé em Cristo é o caminho para a vida eterna"),
        PostKeyPoint(text="A salvação é uma dádiva gratuita de Deus"),
    ],
    tags=["Salvação", "AmorDeDeus", "VidaEterna", "EvangelhoDeJoão", "Fé", "Graça"],
    devotional_meditation=(
        "Medite neste versículo ao longo do dia. Considere a profundidade do amor "
        "de Deus que o levou a dar o que tinha de mais precioso por você."
    ),
    devotional_prayer=(
        "Senhor, obrigado pelo Teu amor incondicional. Que eu possa compreender "
        "a grandeza do que foi feito por mim na cruz. Que minha vida reflita "
        "esse amor aos que estão ao meu redor. Amém."
    ),
    audio_url="https://example.com/audio/post-001.mp3",
    audio_duration="5:00",
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _load_scraped_posts() -> list[PostSummary]:
    """Carrega posts do JSON gerado pelo ETL. Retorna lista vazia se não existir."""
    data = read_json("posts.json")
    if not isinstance(data, list) or not data:
        return []
    summaries = []
    for item in data:
        try:
            summaries.append(PostSummary(
                id=item["id"],
                title=item["title"],
                reference=item.get("reference", ""),
                category=item.get("category", "Reflexão"),
                date=item.get("date", ""),
                thumbnail_url=item.get("thumbnail_url"),
                is_new=item.get("is_new", False),
                is_starred=item.get("is_starred", False),
                tags=item.get("tags", []),
            ))
        except Exception:
            continue
    return summaries


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/feed", response_model=FeedResponse)
def get_feed(user_id: str = Depends(get_current_user_id)) -> FeedResponse:
    """Retorna o feed com post do dia e posts recentes.

    Usa posts coletados pelo ETL quando disponíveis; caso contrário, retorna mock.
    """
    scraped = _load_scraped_posts()
    if scraped:
        post_of_day = scraped[0]
        recent_posts = scraped[1:5]
    else:
        post_of_day = MOCK_POST_OF_DAY
        recent_posts = MOCK_RECENT_POSTS

    return FeedResponse(post_of_day=post_of_day, recent_posts=recent_posts)


@router.get("", response_model=list[PostSummary])
def list_posts(
    query: str | None = None,
    tag: str | None = None,
    user_id: str = Depends(get_current_user_id),
) -> list[PostSummary]:
    """Lista todos os posts com busca e filtro opcional."""
    scraped = _load_scraped_posts()
    posts = scraped if scraped else ([MOCK_POST_OF_DAY] + MOCK_RECENT_POSTS)

    if query:
        posts = [p for p in posts if query.lower() in p.title.lower()]
    if tag:
        posts = [p for p in posts if tag in (p.tags or [])]
    return posts


def _load_post_detail(post_id: str) -> PostDetail | None:
    """Busca um post por ID no posts.json e retorna PostDetail ou None."""
    data = read_json("posts.json")
    if not isinstance(data, list):
        return None
    for item in data:
        if not isinstance(item, dict) or item.get("id") != post_id:
            continue
        key_points = [
            PostKeyPoint(text=kp) if isinstance(kp, str) else PostKeyPoint(**kp)
            for kp in item.get("key_points", [])
        ]
        return PostDetail(
            id=item["id"],
            title=item["title"],
            reference=item.get("reference", ""),
            category=item.get("category", "Reflexão"),
            date=item.get("date", ""),
            thumbnail_url=item.get("thumbnail_url"),
            source_url=item.get("source_url"),
            verse_content=item.get("verse_content", ""),
            body_text=item.get("body_text"),
            ai_summary=item.get("ai_summary", ""),
            key_points=key_points,
            tags=item.get("tags", []),
            devotional_meditation=item.get("devotional_meditation", ""),
            devotional_prayer=item.get("devotional_prayer", ""),
            audio_url=item.get("audio_url"),
            audio_duration=item.get("audio_duration"),
        )
    return None


@router.get("/{post_id}", response_model=PostDetail)
def get_post(
    post_id: str,
    user_id: str = Depends(get_current_user_id),
) -> PostDetail:
    """Retorna o detalhe completo de um post (dados reais ou fallback mock)."""
    detail = _load_post_detail(post_id)
    if detail:
        return detail
    raise HTTPException(status_code=404, detail="Post não encontrado.")


@router.get("/{post_id}/audio", response_model=AudioResponse)
def get_post_audio(
    post_id: str,
    user_id: str = Depends(get_current_user_id),
) -> AudioResponse:
    """Retorna a URL do áudio associado ao post."""
    return AudioResponse(
        post_id=post_id,
        url="https://example.com/audio/devocional.mp3",
        duration="5:00",
        title="Devocional em Áudio",
    )
