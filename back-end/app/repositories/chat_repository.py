import uuid
from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.chat import ChatCitation, ChatConversation, ChatMessage


class ChatRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create_conversation(self, user_id: uuid.UUID) -> ChatConversation:
        """Cria uma nova conversa para o usuário."""
        conv = ChatConversation(user_id=user_id)
        self.db.add(conv)
        await self.db.flush()
        return conv

    async def list_conversations(self, user_id: uuid.UUID) -> list[ChatConversation]:
        """Lista conversas do usuário ordenadas pela mais recente."""
        stmt = (
            select(ChatConversation)
            .where(ChatConversation.user_id == user_id)
            .order_by(ChatConversation.updated_at.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_conversation(
        self, conversation_id: uuid.UUID, user_id: uuid.UUID
    ) -> ChatConversation | None:
        """Busca conversa por ID verificando que pertence ao usuário."""
        stmt = select(ChatConversation).where(
            ChatConversation.id == conversation_id,
            ChatConversation.user_id == user_id,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_messages(self, conversation_id: uuid.UUID) -> list[ChatMessage]:
        """Lista mensagens de uma conversa com citações carregadas."""
        stmt = (
            select(ChatMessage)
            .where(ChatMessage.conversation_id == conversation_id)
            .options(selectinload(ChatMessage.citations))
            .order_by(ChatMessage.created_at.asc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def add_message(
        self,
        conversation_id: uuid.UUID,
        role: str,
        content: str,
        citations: list[dict],
    ) -> ChatMessage:
        """Cria mensagem com citações e atualiza contadores da conversa."""
        msg = ChatMessage(
            conversation_id=conversation_id,
            role=role,
            content=content,
        )
        self.db.add(msg)
        await self.db.flush()  # obtém o ID antes de inserir citações

        for cit in citations:
            self.db.add(
                ChatCitation(
                    message_id=msg.id,
                    reference=cit.get("reference", ""),
                    book=cit.get("book"),
                    chapter=cit.get("chapter"),
                    verse=cit.get("verse"),
                )
            )

        # Atualiza contadores da conversa
        preview = content[:120] if role == "assistant" else None
        stmt = (
            update(ChatConversation)
            .where(ChatConversation.id == conversation_id)
            .values(
                message_count=ChatConversation.message_count + 1,
                updated_at=datetime.now(timezone.utc),
                **({"last_message_preview": preview} if preview else {}),
            )
        )
        await self.db.execute(stmt)
        await self.db.flush()

        # Recarrega com citações
        await self.db.refresh(msg)
        stmt_cit = select(ChatMessage).where(ChatMessage.id == msg.id).options(
            selectinload(ChatMessage.citations)
        )
        result = await self.db.execute(stmt_cit)
        return result.scalar_one()
