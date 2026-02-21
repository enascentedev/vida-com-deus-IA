from typing import Literal

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.domain.auth.schemas import MessageResponse
from app.domain.library.schemas import FavoriteToggleResponse, HistoryRecordRequest, LibraryResponse
from app.services.library_service import LibraryService

router = APIRouter(prefix="/library", tags=["Library"])


@router.get("", response_model=LibraryResponse)
async def get_library(
    tab: Literal["favorites", "history"] = "favorites",
    query: str | None = None,
    tag: str | None = None,
    period: str | None = None,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> LibraryResponse:
    """Lista itens da biblioteca (favoritos ou histórico) com filtros."""
    service = LibraryService(db)
    return await service.get_library(user_id, tab=tab, query=query, tag=tag)


@router.post("/favorites/{post_id}", response_model=FavoriteToggleResponse, status_code=201)
async def add_favorite(
    post_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> FavoriteToggleResponse:
    """Adiciona um post aos favoritos."""
    service = LibraryService(db)
    return await service.add_favorite(user_id, post_id)


@router.delete("/favorites/{post_id}", response_model=FavoriteToggleResponse)
async def remove_favorite(
    post_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> FavoriteToggleResponse:
    """Remove um post dos favoritos."""
    service = LibraryService(db)
    return await service.remove_favorite(user_id, post_id)


@router.post("/history", response_model=MessageResponse, status_code=201)
async def record_history(
    body: HistoryRecordRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    """Registra um acesso ao histórico de leitura."""
    service = LibraryService(db)
    return await service.record_history(user_id, body.post_id)
