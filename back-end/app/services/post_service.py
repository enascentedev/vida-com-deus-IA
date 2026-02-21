"""Serviço de negócio para o domínio de posts."""

import uuid

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.posts.schemas import (
    AudioResponse,
    FeedResponse,
    PostDetail,
    PostKeyPoint,
    PostSummary,
)
from app.models.post import Post
from app.repositories.post_repository import PostRepository


def _post_to_summary(post: Post) -> PostSummary:
    """Converte modelo SQLAlchemy para schema PostSummary."""
    return PostSummary(
        id=str(post.id),
        title=post.title,
        reference=post.reference or "",
        category=post.category or "",
        date=post.date or "",
        thumbnail_url=post.thumbnail_url,
        is_new=False,
        is_starred=False,
        tags=[t.name for t in post.tags],
    )


def _post_to_detail(post: Post) -> PostDetail:
    """Converte modelo SQLAlchemy para schema PostDetail."""
    # Extrai key_points do body_text (mesmo comportamento do scraper)
    key_points: list[PostKeyPoint] = []
    if post.body_text:
        import re

        sentences = re.split(r"(?<=[.!?])\s+", post.body_text)
        key_points = [
            PostKeyPoint(text=s)
            for s in sentences[:5]
            if 20 < len(s) < 200
        ][:3]

    return PostDetail(
        id=str(post.id),
        title=post.title,
        reference=post.reference or "",
        category=post.category or "",
        date=post.date or "",
        thumbnail_url=post.thumbnail_url,
        source_url=post.source_url,
        verse_content=post.verse_content or "",
        body_text=post.body_text,
        ai_summary=post.ai_summary or "",
        key_points=key_points,
        tags=[t.name for t in post.tags],
        devotional_meditation=post.devotional_meditation or "",
        devotional_prayer=post.devotional_prayer or "",
        audio_url=post.audio_url,
        audio_duration=post.audio_duration,
    )


class PostService:
    """Lógica de negócio para posts."""

    def __init__(self, db: AsyncSession) -> None:
        self.repo = PostRepository(db)

    async def get_feed(self) -> FeedResponse:
        """Retorna feed com post do dia e posts recentes."""
        featured, recent = await self.repo.get_feed()

        if not featured:
            raise HTTPException(
                status_code=404,
                detail="Nenhum post disponível no feed.",
            )

        return FeedResponse(
            post_of_day=_post_to_summary(featured),
            recent_posts=[_post_to_summary(p) for p in recent],
        )

    async def list_posts(
        self, query: str | None = None, tag: str | None = None
    ) -> list[PostSummary]:
        """Lista posts com busca e filtro opcional."""
        posts = await self.repo.list_posts(query=query, tag=tag)
        return [_post_to_summary(p) for p in posts]

    async def get_post_detail(self, post_id: str) -> PostDetail:
        """Retorna detalhe completo de um post."""
        try:
            pid = uuid.UUID(post_id)
        except ValueError:
            raise HTTPException(status_code=404, detail="Post não encontrado.")

        post = await self.repo.get_by_id(pid)
        if not post:
            raise HTTPException(status_code=404, detail="Post não encontrado.")

        return _post_to_detail(post)

    async def get_post_audio(self, post_id: str) -> AudioResponse:
        """Retorna URL do áudio associado ao post."""
        try:
            pid = uuid.UUID(post_id)
        except ValueError:
            raise HTTPException(status_code=404, detail="Post não encontrado.")

        post = await self.repo.get_by_id(pid)
        if not post:
            raise HTTPException(status_code=404, detail="Post não encontrado.")

        return AudioResponse(
            post_id=str(post.id),
            url=post.audio_url or "",
            duration=post.audio_duration or "0:00",
            title=post.title,
        )
