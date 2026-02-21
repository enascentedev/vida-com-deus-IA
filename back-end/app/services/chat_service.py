import os
import uuid

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
from app.models.chat import ChatMessage as ChatMessageModel
from app.repositories.chat_repository import ChatRepository

# ── Prompt de sistema — especialista bíblico ─────────────────────────────────
SYSTEM_PROMPT = """Você é um especialista em Bíblia Sagrada com profundo conhecimento das escrituras cristãs.
Responda sempre em Português do Brasil de forma pastoral, respeitosa e edificante.
Ao citar versículos, indique o livro, capítulo e versículo (ex.: "João 3:16").
Baseie suas respostas exclusivamente nas escrituras bíblicas.
Seja conciso, claro e espiritualmente enriquecedor."""


def _call_openai(user_message: str) -> tuple[str, list[dict]]:
    """
    Chama o GPT-4o-mini com o prompt bíblico.
    Retorna (conteúdo da resposta, lista de dicts de citação).
    Faz fallback para resposta mock se a chave não estiver configurada.
    """
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return (
            "Com base na sua pergunta, posso compartilhar que a Bíblia oferece "
            "sabedoria profunda sobre este tema. "
            "Provérbios 3:5-6 nos instrui a confiar no Senhor de todo o coração "
            "e não nos apoiar no nosso próprio entendimento.",
            [{"reference": "Provérbios 3:5-6", "book": "Provérbios", "chapter": 3, "verse": "5-6"}],
        )

    from openai import OpenAI

    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        max_tokens=600,
        temperature=0.7,
    )
    content = response.choices[0].message.content or ""
    return content, []


class ChatService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = ChatRepository(db)

    async def create_conversation(self, user_id: str) -> Conversation:
        """Cria nova conversa para o usuário."""
        conv = await self.repo.create_conversation(uuid.UUID(user_id))
        return self._conv_to_schema(conv)

    async def list_conversations(self, user_id: str) -> ConversationListResponse:
        """Lista conversas do usuário."""
        convs = await self.repo.list_conversations(uuid.UUID(user_id))
        return ConversationListResponse(
            conversations=[self._conv_to_schema(c) for c in convs]
        )

    async def get_messages(self, conversation_id: str, user_id: str) -> MessagesResponse:
        """Retorna mensagens de uma conversa verificando ownership."""
        conv = await self.repo.get_conversation(
            uuid.UUID(conversation_id), uuid.UUID(user_id)
        )
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
        """Envia mensagem, chama OpenAI e persiste resposta."""
        conv = await self.repo.get_conversation(
            uuid.UUID(conversation_id), uuid.UUID(user_id)
        )
        if not conv:
            raise HTTPException(status_code=404, detail="Conversa não encontrada.")

        # Persiste mensagem do usuário
        user_msg = await self.repo.add_message(
            uuid.UUID(conversation_id), role="user", content=content, citations=[]
        )

        # Chama OpenAI (ou fallback mock)
        ai_content, citations = _call_openai(content)

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
        return ChatMessage(
            id=str(msg.id),
            role=msg.role,
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
