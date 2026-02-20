from typing import Literal

from pydantic import BaseModel


class Citation(BaseModel):
    reference: str
    book: str | None = None
    chapter: int | None = None
    verse: str | None = None


class ChatMessage(BaseModel):
    id: str
    role: Literal["user", "assistant"]
    content: str
    citations: list[Citation] = []
    created_at: str


class Conversation(BaseModel):
    id: str
    user_id: str
    created_at: str
    message_count: int = 0
    last_message_preview: str | None = None


class ConversationListResponse(BaseModel):
    conversations: list[Conversation]


class MessagesResponse(BaseModel):
    conversation_id: str
    messages: list[ChatMessage]


class SendMessageRequest(BaseModel):
    content: str


class SendMessageResponse(BaseModel):
    user_message: ChatMessage
    assistant_message: ChatMessage
