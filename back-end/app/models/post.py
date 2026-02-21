"""Modelos SQLAlchemy para o domínio de posts."""

import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Post(BaseModel):
    """Post devocional coletado pelo ETL ou criado manualmente."""

    __tablename__ = "posts"

    title: Mapped[str] = mapped_column(String, index=True)
    reference: Mapped[str | None] = mapped_column(String, default=None)
    category: Mapped[str | None] = mapped_column(String, default=None)
    date: Mapped[str | None] = mapped_column(String, default=None)
    thumbnail_url: Mapped[str | None] = mapped_column(String, default=None)
    source_url: Mapped[str | None] = mapped_column(String, unique=True, default=None)
    verse_content: Mapped[str | None] = mapped_column(String, default=None)
    body_text: Mapped[str | None] = mapped_column(String, default=None)
    ai_summary: Mapped[str | None] = mapped_column(String, default=None)
    devotional_meditation: Mapped[str | None] = mapped_column(String, default=None)
    devotional_prayer: Mapped[str | None] = mapped_column(String, default=None)
    audio_url: Mapped[str | None] = mapped_column(String, default=None)
    audio_duration: Mapped[str | None] = mapped_column(String, default=None)
    is_featured: Mapped[bool] = mapped_column(default=False)

    # Relacionamento com tags
    tags: Mapped[list["PostTag"]] = relationship(
        back_populates="post", cascade="all, delete-orphan"
    )


class PostTag(BaseModel):
    """Tag associada a um post."""

    __tablename__ = "post_tags"

    post_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String, index=True)

    post: Mapped["Post"] = relationship(back_populates="tags")
