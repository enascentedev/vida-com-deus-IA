from typing import Literal

from pydantic import BaseModel


class LibraryItem(BaseModel):
    id: str
    post_id: str
    title: str
    subtitle: str
    type: Literal["post", "chat"] = "post"
    saved_at: str
    tags: list[str] = []


class LibraryResponse(BaseModel):
    items: list[LibraryItem]
    total: int


class FavoriteToggleResponse(BaseModel):
    post_id: str
    is_favorited: bool
    message: str


class HistoryRecordRequest(BaseModel):
    post_id: str
