"""converte datas dos posts de formato pt-BR para ISO 8601

Converte strings no formato "DD de MMMM de YYYY" para "YYYY-MM-DD" na
coluna `date` da tabela `posts`, garantindo ordenação correta no feed.

Revision ID: c3d4e5f6a7b8
Revises: a1b2c3d4e5f6
Create Date: 2026-02-22 12:00:00.000000
"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_UPGRADE_SQL = """
DO $$
DECLARE
    r         RECORD;
    parts     TEXT[];
    month_num TEXT;
    iso_date  TEXT;
BEGIN
    FOR r IN
        SELECT id, date FROM posts WHERE date LIKE '% de %'
    LOOP
        -- Divide em ["DD", "MMMM", "YYYY"] usando ' de ' como delimitador
        parts := string_to_array(r.date, ' de ');

        IF array_length(parts, 1) <> 3 THEN
            CONTINUE;
        END IF;

        month_num := CASE lower(parts[2])
            WHEN 'janeiro'   THEN '01'
            WHEN 'fevereiro' THEN '02'
            WHEN 'março'     THEN '03'
            WHEN 'abril'     THEN '04'
            WHEN 'maio'      THEN '05'
            WHEN 'junho'     THEN '06'
            WHEN 'julho'     THEN '07'
            WHEN 'agosto'    THEN '08'
            WHEN 'setembro'  THEN '09'
            WHEN 'outubro'   THEN '10'
            WHEN 'novembro'  THEN '11'
            WHEN 'dezembro'  THEN '12'
            ELSE NULL
        END;

        IF month_num IS NULL THEN
            CONTINUE;
        END IF;

        iso_date := parts[3] || '-' || month_num || '-' || lpad(trim(parts[1]), 2, '0');

        -- Valida que gerou um formato YYYY-MM-DD antes de gravar
        IF iso_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN
            UPDATE posts SET date = iso_date WHERE id = r.id;
        END IF;
    END LOOP;
END;
$$;
"""

_DOWNGRADE_SQL = """
DO $$
DECLARE
    r          RECORD;
    yr         TEXT;
    mo         TEXT;
    dy         TEXT;
    month_name TEXT;
    br_date    TEXT;
BEGIN
    FOR r IN
        SELECT id, date FROM posts
        WHERE date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    LOOP
        yr := split_part(r.date, '-', 1);
        mo := split_part(r.date, '-', 2);
        dy := ltrim(split_part(r.date, '-', 3), '0');

        month_name := CASE mo
            WHEN '01' THEN 'janeiro'
            WHEN '02' THEN 'fevereiro'
            WHEN '03' THEN 'março'
            WHEN '04' THEN 'abril'
            WHEN '05' THEN 'maio'
            WHEN '06' THEN 'junho'
            WHEN '07' THEN 'julho'
            WHEN '08' THEN 'agosto'
            WHEN '09' THEN 'setembro'
            WHEN '10' THEN 'outubro'
            WHEN '11' THEN 'novembro'
            WHEN '12' THEN 'dezembro'
            ELSE NULL
        END;

        IF month_name IS NULL THEN
            CONTINUE;
        END IF;

        br_date := dy || ' de ' || month_name || ' de ' || yr;
        UPDATE posts SET date = br_date WHERE id = r.id;
    END LOOP;
END;
$$;
"""


def upgrade() -> None:
    op.execute(_UPGRADE_SQL)


def downgrade() -> None:
    op.execute(_DOWNGRADE_SQL)
