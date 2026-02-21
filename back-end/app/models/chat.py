import uuid

from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class ChatConversation(BaseModel):
    """Conversa do chat bíblico de um usuário."""

    __tablename__ = "chat_conversations"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    message_count: Mapped[int] = mapped_column(default=0)
    last_message_preview: Mapped[str | None]

    messages: Mapped[list["ChatMessage"]] = relationship(
        back_populates="conversation", cascade="all, delete-orphan"
    )


class ChatMessage(BaseModel):
    """Mensagem individual de uma conversa (usuário ou assistente)."""

    __tablename__ = "chat_messages"

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("chat_conversations.id", ondelete="CASCADE"), index=True
    )
    role: Mapped[str]  # "user" | "assistant"
    content: Mapped[str] = mapped_column(Text)

    conversation: Mapped["ChatConversation"] = relationship(back_populates="messages")
    citations: Mapped[list["ChatCitation"]] = relationship(
        back_populates="message", cascade="all, delete-orphan"
    )


class ChatCitation(BaseModel):
    """Citação bíblica extraída de uma mensagem do assistente."""

    __tablename__ = "chat_citations"

    message_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("chat_messages.id", ondelete="CASCADE"), index=True
    )
    reference: Mapped[str]   # ex: "João 3:16"
    book: Mapped[str | None]
    chapter: Mapped[int | None]
    verse: Mapped[str | None]

    message: Mapped["ChatMessage"] = relationship(back_populates="citations")
