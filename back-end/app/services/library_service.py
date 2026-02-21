import uuid

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.schemas import MessageResponse
from app.domain.library.schemas import (
    FavoriteToggleResponse,
    LibraryItem,
    LibraryResponse,
)
from app.repositories.library_repository import LibraryRepository
from app.repositories.post_repository import PostRepository


class LibraryService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = LibraryRepository(db)
        self.post_repo = PostRepository(db)

    async def get_library(
        self,
        user_id: str,
        tab: str,
        query: str | None,
        tag: str | None,
    ) -> LibraryResponse:
        """Retorna favoritos ou histórico do usuário com filtros opcionais."""
        uid = uuid.UUID(user_id)

        if tab == "favorites":
            records = await self.repo.list_favorites(uid, query=query, tag=tag)
        else:
            records = await self.repo.list_history(uid, query=query, tag=tag)

        items = [self._to_library_item(r) for r in records]
        return LibraryResponse(items=items, total=len(items))

    async def add_favorite(self, user_id: str, post_id: str) -> FavoriteToggleResponse:
        """Adiciona post aos favoritos. Lança 404 se o post não existir."""
        uid = uuid.UUID(user_id)
        pid = uuid.UUID(post_id)

        post = await self.post_repo.get_by_id(pid)
        if not post:
            raise HTTPException(status_code=404, detail="Post não encontrado.")

        await self.repo.add_favorite(uid, pid)
        return FavoriteToggleResponse(
            post_id=post_id,
            is_favorited=True,
            message="Post adicionado aos favoritos.",
        )

    async def remove_favorite(
        self, user_id: str, post_id: str
    ) -> FavoriteToggleResponse:
        """Remove post dos favoritos."""
        uid = uuid.UUID(user_id)
        pid = uuid.UUID(post_id)
        await self.repo.remove_favorite(uid, pid)
        return FavoriteToggleResponse(
            post_id=post_id,
            is_favorited=False,
            message="Post removido dos favoritos.",
        )

    async def record_history(self, user_id: str, post_id: str) -> MessageResponse:
        """Registra acesso ao post no histórico."""
        uid = uuid.UUID(user_id)
        pid = uuid.UUID(post_id)
        await self.repo.record_history(uid, pid)
        return MessageResponse(message=f"Acesso ao post {post_id} registrado.")

    # ── Conversão de modelos ──────────────────────────────────────────────────

    @staticmethod
    def _to_library_item(record: object) -> LibraryItem:
        """Converte Favorite ou ReadingHistory em LibraryItem."""
        post = record.post  # type: ignore[attr-defined]
        tags = [t.name for t in post.tags] if post.tags else []
        tag_label = f" • #{tags[0]}" if tags else ""
        saved_dt = record.created_at  # type: ignore[attr-defined]
        saved_str = saved_dt.strftime("%d/%m/%Y") if saved_dt else ""

        return LibraryItem(
            id=str(record.id),  # type: ignore[attr-defined]
            post_id=str(record.post_id),  # type: ignore[attr-defined]
            title=post.title,
            subtitle=f"Salvo em {saved_str}{tag_label}",
            type="post",
            saved_at=saved_dt.date().isoformat() if saved_dt else "",
            tags=tags,
        )
