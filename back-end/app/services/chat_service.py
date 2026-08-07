import uuid
from typing import Literal

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.chat.schemas import (
    ChatMessage,
    Citation,
    Conversation,
    ConversationListResponse,
    MessagesResponse,
    SendMessageResponse,
)
from app.integrations.openai_client import BiblicalAssistant, build_assistant
from app.models.chat import ChatMessage as ChatMessageModel
from app.repositories.chat_repository import ChatRepository


class ChatService:
    def __init__(self, db: AsyncSession, assistant: BiblicalAssistant | None = None) -> None:
        self.db = db
        self.repo = ChatRepository(db)
        # Injetável para que os testes nunca dependam de rede.
        self._assistant = assistant

    async def create_conversation(self, user_id: str) -> Conversation:
        """Cria nova conversa para o usuário."""
        conv = await self.repo.create_conversation(uuid.UUID(user_id))
        return self._conv_to_schema(conv)

    async def list_conversations(self, user_id: str) -> ConversationListResponse:
        """Lista conversas do usuário."""
        convs = await self.repo.list_conversations(uuid.UUID(user_id))
        return ConversationListResponse(conversations=[self._conv_to_schema(c) for c in convs])

    async def get_messages(self, conversation_id: str, user_id: str) -> MessagesResponse:
        """Retorna mensagens de uma conversa verificando ownership."""
        conv = await self.repo.get_conversation(uuid.UUID(conversation_id), uuid.UUID(user_id))
        if not conv:
            raise HTTPException(status_code=404, detail="Conversa não encontrada.")

        messages = await self.repo.list_messages(uuid.UUID(conversation_id))
        return MessagesResponse(
            conversation_id=conversation_id,
            messages=[self._msg_to_schema(m) for m in messages],
        )

    async def send_message(
        self, conversation_id: str, user_id: str, content: str
    ) -> SendMessageResponse:
        """Persiste a mensagem do usuário, consulta o assistente e persiste a resposta."""
        conv = await self.repo.get_conversation(uuid.UUID(conversation_id), uuid.UUID(user_id))
        if not conv:
            raise HTTPException(status_code=404, detail="Conversa não encontrada.")

        # Persiste mensagem do usuário
        user_msg = await self.repo.add_message(
            uuid.UUID(conversation_id), role="user", content=content, citations=[]
        )

        assistant = self._assistant or build_assistant()
        ai_content, citations = assistant.reply(content)

        # Persiste resposta da IA com citações
        ai_msg = await self.repo.add_message(
            uuid.UUID(conversation_id),
            role="assistant",
            content=ai_content,
            citations=citations,
        )

        return SendMessageResponse(
            user_message=self._msg_to_schema(user_msg),
            assistant_message=self._msg_to_schema(ai_msg),
        )

    # ── Conversão de modelos ──────────────────────────────────────────────────

    @staticmethod
    def _conv_to_schema(conv: object) -> Conversation:
        return Conversation(
            id=str(conv.id),  # type: ignore[attr-defined]
            user_id=str(conv.user_id),  # type: ignore[attr-defined]
            created_at=conv.created_at.isoformat(),  # type: ignore[attr-defined]
            message_count=conv.message_count,  # type: ignore[attr-defined]
            last_message_preview=conv.last_message_preview,  # type: ignore[attr-defined]
        )

    @staticmethod
    def _msg_to_schema(msg: ChatMessageModel) -> ChatMessage:
        # No banco role é str; o schema restringe ao literal "user" | "assistant".
        role: Literal["user", "assistant"] = "assistant" if msg.role == "assistant" else "user"
        return ChatMessage(
            id=str(msg.id),
            role=role,
            content=msg.content,
            citations=[
                Citation(
                    reference=c.reference,
                    book=c.book,
                    chapter=c.chapter,
                    verse=c.verse,
                )
                for c in (msg.citations or [])
            ],
            created_at=msg.created_at.isoformat(),
        )
