from fastapi import APIRouter, Depends

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.domain.posts.schemas import AudioResponse, FeedResponse, PostDetail, PostSummary
from app.services.post_service import PostService

router = APIRouter(prefix="/posts", tags=["Posts"])


@router.get("/feed", response_model=FeedResponse)
async def get_feed(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> FeedResponse:
    """Retorna o feed com post do dia e posts recentes."""
    service = PostService(db)
    return await service.get_feed()


@router.get("", response_model=list[PostSummary])
async def list_posts(
    query: str | None = None,
    tag: str | None = None,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> list[PostSummary]:
    """Lista todos os posts com busca e filtro opcional."""
    service = PostService(db)
    return await service.list_posts(query=query, tag=tag)


@router.get("/{post_id}", response_model=PostDetail)
async def get_post(
    post_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> PostDetail:
    """Retorna o detalhe completo de um post."""
    service = PostService(db)
    return await service.get_post_detail(post_id)


@router.get("/{post_id}/audio", response_model=AudioResponse)
async def get_post_audio(
    post_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> AudioResponse:
    """Retorna a URL do áudio associado ao post."""
    service = PostService(db)
    return await service.get_post_audio(post_id)
