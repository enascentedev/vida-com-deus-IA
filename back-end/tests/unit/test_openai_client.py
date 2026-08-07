"""O chat não pode entregar texto simulado como se fosse resposta do modelo.

Estes testes fixam as três situações possíveis: com chave usa a OpenAI; sem chave
em desenvolvimento usa um stub que se identifica no próprio texto; sem chave em
produção falha com 503 em vez de improvisar.
"""

import pytest
from fastapi import HTTPException

from app.integrations.openai_client import (
    STUB_PREFIX,
    OpenAIBiblicalAssistant,
    StubBiblicalAssistant,
    build_assistant,
)


def test_stub_declara_que_a_resposta_e_simulada():
    content, citations = StubBiblicalAssistant().reply("O que é a fé?")

    assert content.startswith(STUB_PREFIX)
    assert citations, "o stub devolve ao menos uma citação de exemplo"


def test_sem_chave_em_desenvolvimento_usa_stub(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.setattr("app.integrations.openai_client.settings.environment", "development")

    assert isinstance(build_assistant(), StubBiblicalAssistant)


def test_sem_chave_em_producao_responde_503(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.setattr("app.integrations.openai_client.settings.environment", "production")

    with pytest.raises(HTTPException) as exc:
        build_assistant()

    assert exc.value.status_code == 503


def test_com_chave_usa_a_implementacao_real(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "sk-chave-de-teste")
    monkeypatch.setattr("app.integrations.openai_client.settings.environment", "production")

    assert isinstance(build_assistant(), OpenAIBiblicalAssistant)
