import uuid

from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.library import Favorite, ReadingHistory
from app.models.post import Post


class LibraryRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_favorites(
        self,
        user_id: uuid.UUID,
        query: str | None = None,
        tag: str | None = None,
    ) -> list[Favorite]:
        """Lista favoritos do usuário com post carregado, ordenados por data de criação."""
        stmt = (
            select(Favorite)
            .where(Favorite.user_id == user_id)
            .options(selectinload(Favorite.post).selectinload(Post.tags))
            .order_by(Favorite.created_at.desc())
        )
        result = await self.db.execute(stmt)
        favorites = list(result.scalars().all())

        # Filtros aplicados em memória (base ainda pequena)
        if query:
            favorites = [f for f in favorites if query.lower() in f.post.title.lower()]
        if tag:
            favorites = [
                f for f in favorites if any(t.name == tag for t in f.post.tags)
            ]
        return favorites

    async def is_favorited(self, user_id: uuid.UUID, post_id: uuid.UUID) -> bool:
        """Verifica se o post já está nos favoritos do usuário."""
        stmt = select(Favorite).where(
            Favorite.user_id == user_id, Favorite.post_id == post_id
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def add_favorite(self, user_id: uuid.UUID, post_id: uuid.UUID) -> Favorite:
        """Adiciona favorito. Se já existe, retorna o existente."""
        existing = await self.db.execute(
            select(Favorite).where(
                Favorite.user_id == user_id, Favorite.post_id == post_id
            )
        )
        fav = existing.scalar_one_or_none()
        if fav:
            return fav

        fav = Favorite(user_id=user_id, post_id=post_id)
        self.db.add(fav)
        try:
            await self.db.flush()
        except IntegrityError:
            await self.db.rollback()
            result = await self.db.execute(
                select(Favorite).where(
                    Favorite.user_id == user_id, Favorite.post_id == post_id
                )
            )
            fav = result.scalar_one()
        return fav

    async def remove_favorite(self, user_id: uuid.UUID, post_id: uuid.UUID) -> None:
        """Remove favorito se existir."""
        await self.db.execute(
            delete(Favorite).where(
                Favorite.user_id == user_id, Favorite.post_id == post_id
            )
        )

    async def list_history(
        self,
        user_id: uuid.UUID,
        query: str | None = None,
        tag: str | None = None,
    ) -> list[ReadingHistory]:
        """Lista histórico do usuário com post carregado, ordenado por data."""
        stmt = (
            select(ReadingHistory)
            .where(ReadingHistory.user_id == user_id)
            .options(selectinload(ReadingHistory.post).selectinload(Post.tags))
            .order_by(ReadingHistory.created_at.desc())
        )
        result = await self.db.execute(stmt)
        history = list(result.scalars().all())

        if query:
            history = [h for h in history if query.lower() in h.post.title.lower()]
        if tag:
            history = [
                h for h in history if any(t.name == tag for t in h.post.tags)
            ]
        return history

    async def record_history(
        self, user_id: uuid.UUID, post_id: uuid.UUID
    ) -> ReadingHistory:
        """Registra acesso ao post no histórico de leitura."""
        entry = ReadingHistory(user_id=user_id, post_id=post_id)
        self.db.add(entry)
        await self.db.flush()
        return entry
