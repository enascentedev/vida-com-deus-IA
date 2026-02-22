"""cria tabela storage_snapshots para monitoramento de storage

Revision ID: a1b2c3d4e5f6
Revises: dc263afe3007
Create Date: 2026-02-22 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "dc263afe3007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "storage_snapshots",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column(
            "measured_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.Column("used_bytes", sa.BigInteger(), nullable=False),
        sa.Column("total_bytes", sa.BigInteger(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    # Índice em measured_at para queries de range por data
    op.create_index("idx_storage_snapshots_measured_at", "storage_snapshots", ["measured_at"])


def downgrade() -> None:
    op.drop_index("idx_storage_snapshots_measured_at", table_name="storage_snapshots")
    op.drop_table("storage_snapshots")
