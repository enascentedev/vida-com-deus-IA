import uuid

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Favorite(BaseModel):
    """Favorito de um post pelo usuário."""

    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint("user_id", "post_id", name="uq_favorite_user_post"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    post_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"), index=True
    )

    post: Mapped["Post"] = relationship("Post", lazy="noload")  # type: ignore[name-defined]


class ReadingHistory(BaseModel):
    """Registro de leitura de um post pelo usuário."""

    __tablename__ = "reading_history"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    post_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"), index=True
    )

    post: Mapped["Post"] = relationship("Post", lazy="noload")  # type: ignore[name-defined]
