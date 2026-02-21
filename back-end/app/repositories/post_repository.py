"""Repositório de acesso a dados para posts."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.post import Post, PostTag


class PostRepository:
    """Operações de leitura e escrita para posts no banco de dados."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_feed(self) -> tuple[Post | None, list[Post]]:
        """Retorna (post mais recente, próximos 4) para o feed."""
        stmt = (
            select(Post)
            .options(selectinload(Post.tags))
            .order_by(Post.created_at.desc())
            .limit(5)
        )
        result = await self.db.execute(stmt)
        posts = list(result.scalars().all())

        if not posts:
            return None, []

        return posts[0], posts[1:5]

    async def list_posts(
        self, query: str | None = None, tag: str | None = None
    ) -> list[Post]:
        """Lista posts com busca por título (ILIKE) ou filtro por tag."""
        stmt = select(Post).options(selectinload(Post.tags))

        if query:
            stmt = stmt.where(Post.title.ilike(f"%{query}%"))

        if tag:
            stmt = stmt.where(
                Post.id.in_(
                    select(PostTag.post_id).where(PostTag.name == tag)
                )
            )

        stmt = stmt.order_by(Post.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, post_id: uuid.UUID) -> Post | None:
        """Busca post por ID com eager load das tags."""
        stmt = (
            select(Post)
            .options(selectinload(Post.tags))
            .where(Post.id == post_id)
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_source_url(self, source_url: str) -> Post | None:
        """Busca post pela URL de origem (usada no upsert do ETL)."""
        stmt = select(Post).where(Post.source_url == source_url)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def upsert(self, post_data: dict) -> tuple[Post, bool]:
        """Insere ou atualiza um post com base na source_url.

        Retorna (post, criado: bool).
        Se source_url já existe, atualiza campos; caso contrário, cria.
        Tags são recriadas a cada upsert.
        """
        tags_data = post_data.pop("tags", [])
        source_url = post_data.get("source_url")

        existing = None
        if source_url:
            existing = await self.get_by_source_url(source_url)

        if existing:
            # Atualiza campos do post existente
            for key, value in post_data.items():
                if key not in ("id", "created_at") and hasattr(existing, key):
                    setattr(existing, key, value)

            # Recria tags
            existing.tags.clear()
            await self.db.flush()
            for tag_name in tags_data:
                existing.tags.append(PostTag(name=tag_name))

            return existing, False

        # Cria novo post
        # Remove campos que não pertencem ao modelo
        post_data.pop("id", None)
        post_data.pop("is_new", None)
        post_data.pop("is_starred", None)
        post_data.pop("key_points", None)
        post_data.pop("collected_at", None)

        post = Post(**post_data)
        for tag_name in tags_data:
            post.tags.append(PostTag(name=tag_name))

        self.db.add(post)
        await self.db.flush()
        return post, True
