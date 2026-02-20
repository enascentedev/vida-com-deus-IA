from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user_id
from app.domain.chat.schemas import (
    ChatMessage,
    Citation,
    Conversation,
    ConversationListResponse,
    MessagesResponse,
    SendMessageRequest,
    SendMessageResponse,
)

router = APIRouter(prefix="/chat", tags=["Chat"])

MOCK_CONVERSATION = Conversation(
    id="conv-001",
    user_id="user-mock-001",
    created_at="2024-10-24T10:00:00Z",
    message_count=2,
    last_message_preview="A Bíblia oferece um conforto profundo para a ansiedade...",
)

MOCK_MESSAGES = [
    ChatMessage(
        id="msg-001",
        role="user",
        content="O que a Bíblia diz sobre superar a ansiedade em tempos difíceis?",
        citations=[],
        created_at="2024-10-24T10:00:00Z",
    ),
    ChatMessage(
        id="msg-002",
        role="assistant",
        content=(
            "A Bíblia oferece um conforto profundo para a ansiedade. "
            "Em Filipenses 4:6-7, Paulo nos instrui a não nos preocuparmos com nada, "
            "mas a apresentar nossas necessidades a Deus com oração e gratidão. "
            "A promessa é que a paz de Deus, que excede todo entendimento, "
            "guardará nossos corações e mentes em Cristo Jesus."
        ),
        citations=[
            Citation(reference="Filipenses 4:6-7", book="Filipenses", chapter=4, verse="6-7"),
            Citation(reference="1 Pedro 5:7", book="1 Pedro", chapter=5, verse="7"),
            Citation(reference="Mateus 6:34", book="Mateus", chapter=6, verse="34"),
        ],
        created_at="2024-10-24T10:00:30Z",
    ),
]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


@router.post("/conversations", response_model=Conversation, status_code=201)
def create_conversation(user_id: str = Depends(get_current_user_id)) -> Conversation:
    """Cria uma nova conversa."""
    return Conversation(
        id="conv-new-001",
        user_id=user_id,
        created_at=_now_iso(),
        message_count=0,
    )


@router.get("/conversations", response_model=ConversationListResponse)
def list_conversations(
    user_id: str = Depends(get_current_user_id),
) -> ConversationListResponse:
    """Lista as conversas do usuário."""
    return ConversationListResponse(conversations=[MOCK_CONVERSATION])


@router.get("/conversations/{conversation_id}/messages", response_model=MessagesResponse)
def get_messages(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id),
) -> MessagesResponse:
    """Retorna o histórico de mensagens de uma conversa."""
    return MessagesResponse(
        conversation_id=conversation_id,
        messages=MOCK_MESSAGES,
    )


@router.post(
    "/conversations/{conversation_id}/messages",
    response_model=SendMessageResponse,
    status_code=201,
)
def send_message(
    conversation_id: str,
    body: SendMessageRequest,
    user_id: str = Depends(get_current_user_id),
) -> SendMessageResponse:
    """Envia uma mensagem e recebe resposta da IA."""
    user_msg = ChatMessage(
        id=f"msg-user-{_now_iso()}",
        role="user",
        content=body.content,
        citations=[],
        created_at=_now_iso(),
    )
    assistant_msg = ChatMessage(
        id=f"msg-ai-{_now_iso()}",
        role="assistant",
        content=(
            "Com base na sua pergunta, posso compartilhar que a Bíblia oferece "
            "sabedoria profunda sobre este tema. "
            "Provérbios 3:5-6 nos instrui a confiar no Senhor de todo o coração "
            "e não nos apoiar no nosso próprio entendimento."
        ),
        citations=[
            Citation(reference="Provérbios 3:5-6", book="Provérbios", chapter=3, verse="5-6"),
        ],
        created_at=_now_iso(),
    )
    return SendMessageResponse(user_message=user_msg, assistant_message=assistant_msg)
