from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.domain.chat.schemas import (
    Conversation,
    ConversationListResponse,
    MessagesResponse,
    SendMessageRequest,
    SendMessageResponse,
)
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/conversations", response_model=Conversation, status_code=201)
async def create_conversation(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> Conversation:
    """Cria uma nova conversa."""
    service = ChatService(db)
    return await service.create_conversation(user_id)


@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ConversationListResponse:
    """Lista as conversas do usuário."""
    service = ChatService(db)
    return await service.list_conversations(user_id)


@router.get("/conversations/{conversation_id}/messages", response_model=MessagesResponse)
async def get_messages(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> MessagesResponse:
    """Retorna o histórico de mensagens de uma conversa."""
    service = ChatService(db)
    return await service.get_messages(conversation_id, user_id)


@router.post(
    "/conversations/{conversation_id}/messages",
    response_model=SendMessageResponse,
    status_code=201,
)
async def send_message(
    conversation_id: str,
    body: SendMessageRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> SendMessageResponse:
    """Envia uma mensagem e recebe resposta do GPT-4o-mini."""
    service = ChatService(db)
    return await service.send_message(conversation_id, user_id, body.content)
