"""sessao de refresh token e indices de autenticacao e chat

Agrupa os refresh tokens em sessões (`session_id`) para permitir rotação com
detecção de reuso, registra o instante da revogação e cria os índices usados
pelas consultas de autenticação e de histórico de chat.

Revision ID: e5a7c1b93f20
Revises: c3d4e5f6a7b8
Create Date: 2026-07-30

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "e5a7c1b93f20"
down_revision: Union[str, Sequence[str], None] = "c3d4e5f6a7b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # session_id entra nullable para que a coluna possa ser preenchida nas
    # linhas já existentes antes de virar obrigatória. Cada token antigo passa
    # a ser sua própria sessão — não há histórico de rotação para reconstruir.
    op.add_column("refresh_tokens", sa.Column("session_id", sa.Uuid(), nullable=True))
    op.execute("UPDATE refresh_tokens SET session_id = id WHERE session_id IS NULL")
    op.alter_column("refresh_tokens", "session_id", nullable=False)

    op.add_column(
        "refresh_tokens",
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.execute(
        "UPDATE refresh_tokens SET revoked_at = updated_at "
        "WHERE is_revoked IS TRUE AND revoked_at IS NULL"
    )

    op.create_index(
        op.f("ix_refresh_tokens_session_id"), "refresh_tokens", ["session_id"], unique=False
    )
    op.create_index(
        op.f("ix_refresh_tokens_user_id"), "refresh_tokens", ["user_id"], unique=False
    )

    # O histórico é lido por conversa e em ordem cronológica: o índice composto
    # cobre a consulta e substitui o índice simples em conversation_id.
    op.create_index(
        "ix_chat_messages_conversation_id_created_at",
        "chat_messages",
        ["conversation_id", "created_at"],
        unique=False,
    )
    op.drop_index(op.f("ix_chat_messages_conversation_id"), table_name="chat_messages")


def downgrade() -> None:
    """Downgrade schema."""
    op.create_index(
        op.f("ix_chat_messages_conversation_id"),
        "chat_messages",
        ["conversation_id"],
        unique=False,
    )
    op.drop_index("ix_chat_messages_conversation_id_created_at", table_name="chat_messages")

    op.drop_index(op.f("ix_refresh_tokens_user_id"), table_name="refresh_tokens")
    op.drop_index(op.f("ix_refresh_tokens_session_id"), table_name="refresh_tokens")

    op.drop_column("refresh_tokens", "revoked_at")
    op.drop_column("refresh_tokens", "session_id")
