from typing import Literal

from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user_id
from app.domain.library.schemas import (
    FavoriteToggleResponse,
    HistoryRecordRequest,
    LibraryItem,
    LibraryResponse,
)
from app.domain.auth.schemas import MessageResponse

router = APIRouter(prefix="/library", tags=["Library"])

MOCK_FAVORITES: list[LibraryItem] = [
    LibraryItem(
        id="fav-001",
        post_id="post-001",
        title="Encontrando Paz na Oração",
        subtitle="Salvo em 24 de Out • #Esperança",
        type="post",
        saved_at="2024-10-24",
        tags=["Esperança"],
    ),
    LibraryItem(
        id="fav-002",
        post_id="post-002",
        title="Significado de Salmos 23",
        subtitle="Salvo em 22 de Out • #EstudoBíblico",
        type="chat",
        saved_at="2024-10-22",
        tags=["EstudoBíblico"],
    ),
    LibraryItem(
        id="fav-003",
        post_id="post-003",
        title="Força em Tempos de Incerteza",
        subtitle="Salvo em 20 de Out • #Fé",
        type="post",
        saved_at="2024-10-20",
        tags=["Fé"],
    ),
]

MOCK_HISTORY: list[LibraryItem] = [
    LibraryItem(
        id="hist-001",
        post_id="post-001",
        title="Encontrando Paz no Meio do Caos",
        subtitle="Acessado hoje • #Paz",
        type="post",
        saved_at="2024-10-25",
        tags=["Paz"],
    ),
    LibraryItem(
        id="hist-002",
        post_id="post-002",
        title="A Força na Fraqueza",
        subtitle="Acessado ontem • #Força",
        type="post",
        saved_at="2024-10-24",
        tags=["Força"],
    ),
]


@router.get("", response_model=LibraryResponse)
def get_library(
    tab: Literal["favorites", "history"] = "favorites",
    query: str | None = None,
    tag: str | None = None,
    period: str | None = None,
    user_id: str = Depends(get_current_user_id),
) -> LibraryResponse:
    """Lista itens da biblioteca (favoritos ou histórico) com filtros."""
    items = MOCK_FAVORITES if tab == "favorites" else MOCK_HISTORY

    if query:
        items = [i for i in items if query.lower() in i.title.lower()]
    if tag:
        items = [i for i in items if tag in i.tags]

    return LibraryResponse(items=items, total=len(items))


@router.post("/favorites/{post_id}", response_model=FavoriteToggleResponse, status_code=201)
def add_favorite(
    post_id: str,
    user_id: str = Depends(get_current_user_id),
) -> FavoriteToggleResponse:
    """Adiciona um post aos favoritos."""
    return FavoriteToggleResponse(
        post_id=post_id,
        is_favorited=True,
        message="Post adicionado aos favoritos.",
    )


@router.delete("/favorites/{post_id}", response_model=FavoriteToggleResponse)
def remove_favorite(
    post_id: str,
    user_id: str = Depends(get_current_user_id),
) -> FavoriteToggleResponse:
    """Remove um post dos favoritos."""
    return FavoriteToggleResponse(
        post_id=post_id,
        is_favorited=False,
        message="Post removido dos favoritos.",
    )


@router.post("/history", response_model=MessageResponse, status_code=201)
def record_history(
    body: HistoryRecordRequest,
    user_id: str = Depends(get_current_user_id),
) -> MessageResponse:
    """Registra um acesso ao histórico de leitura."""
    return MessageResponse(message=f"Acesso ao post {body.post_id} registrado.")
