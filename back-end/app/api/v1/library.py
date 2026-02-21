import uuid
from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user_id
from app.core.storage import read_json, write_json
from app.domain.library.schemas import (
    FavoriteToggleResponse,
    HistoryRecordRequest,
    LibraryItem,
    LibraryResponse,
)
from app.domain.auth.schemas import MessageResponse

router = APIRouter(prefix="/library", tags=["Library"])

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


# ── Helpers de persistência ───────────────────────────────────────────────────

def _load_favorites() -> list[LibraryItem]:
    """Carrega favoritos do arquivo JSON."""
    data = read_json("favorites.json")
    if not isinstance(data, list):
        return []
    return [LibraryItem(**item) for item in data]


def _save_favorites(items: list[LibraryItem]) -> None:
    """Persiste lista de favoritos no arquivo JSON."""
    write_json("favorites.json", [item.model_dump() for item in items])


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("", response_model=LibraryResponse)
def get_library(
    tab: Literal["favorites", "history"] = "favorites",
    query: str | None = None,
    tag: str | None = None,
    period: str | None = None,
    user_id: str = Depends(get_current_user_id),
) -> LibraryResponse:
    """Lista itens da biblioteca (favoritos ou histórico) com filtros."""
    items = _load_favorites() if tab == "favorites" else list(MOCK_HISTORY)

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
    """Adiciona um post aos favoritos e persiste no JSON."""
    items = _load_favorites()

    # Evita duplicata
    if not any(i.post_id == post_id for i in items):
        new_item = LibraryItem(
            id=f"fav-{uuid.uuid4().hex[:8]}",
            post_id=post_id,
            title=f"Post {post_id}",
            subtitle=f"Salvo em {date.today().strftime('%d/%m/%Y')}",
            type="post",
            saved_at=date.today().isoformat(),
            tags=[],
        )
        items.append(new_item)
        _save_favorites(items)

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
    """Remove um post dos favoritos e persiste no JSON."""
    items = _load_favorites()
    items = [i for i in items if i.post_id != post_id]
    _save_favorites(items)

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
