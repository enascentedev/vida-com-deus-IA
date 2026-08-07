"""Integração com a OpenAI para as respostas do chat bíblico.

Duas implementações do mesmo protocolo:

- `OpenAIBiblicalAssistant` — chama o modelo de verdade;
- `StubBiblicalAssistant` — devolve um texto fixo, declarado como simulado.

O stub existe para desenvolvimento e testes. Ele nunca é escolhido em produção:
sem `OPENAI_API_KEY`, `build_assistant()` falha e o endpoint responde 503, em
vez de entregar texto genérico como se fosse resposta do modelo.
"""

import logging
import os
from typing import Protocol

from fastapi import HTTPException, status

from app.core.config import settings

logger = logging.getLogger(__name__)

MODEL = "gpt-4o-mini"

SYSTEM_PROMPT = """Você é um especialista em Bíblia Sagrada com profundo conhecimento
das escrituras cristãs.
Responda sempre em Português do Brasil de forma pastoral, respeitosa e edificante.
Ao citar versículos, indique o livro, capítulo e versículo (ex.: "João 3:16").
Baseie suas respostas exclusivamente nas escrituras bíblicas.
Seja conciso, claro e espiritualmente enriquecedor."""

# Prefixo obrigatório do stub: quem lê a resposta sabe que ela não veio do modelo.
STUB_PREFIX = "[resposta simulada — OPENAI_API_KEY não configurada]"


class BiblicalAssistant(Protocol):
    """Fonte das respostas do chat bíblico."""

    def reply(self, user_message: str) -> tuple[str, list[dict[str, object]]]:
        """Devolve (conteúdo, citações) para a mensagem do usuário."""
        ...


class OpenAIBiblicalAssistant:
    """Implementação real, sobre a API da OpenAI."""

    def __init__(self, api_key: str) -> None:
        self._api_key = api_key

    def reply(self, user_message: str) -> tuple[str, list[dict[str, object]]]:
        from openai import OpenAI

        client = OpenAI(api_key=self._api_key)
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            max_tokens=600,
            temperature=0.7,
        )
        content = response.choices[0].message.content or ""
        # A extração de citações a partir do texto ainda não foi implementada;
        # a lista vazia é o estado real, não uma omissão.
        return content, []


class StubBiblicalAssistant:
    """Resposta fixa para desenvolvimento e testes, marcada como simulada."""

    def reply(self, user_message: str) -> tuple[str, list[dict[str, object]]]:
        logger.warning("Chat respondendo com stub: OPENAI_API_KEY não configurada")
        return (
            f"{STUB_PREFIX} Provérbios 3:5-6 nos instrui a confiar no Senhor de todo "
            "o coração e não nos apoiar no nosso próprio entendimento.",
            [
                {
                    "reference": "Provérbios 3:5-6",
                    "book": "Provérbios",
                    "chapter": 3,
                    "verse": "5-6",
                }
            ],
        )


def build_assistant() -> BiblicalAssistant:
    """Escolhe a implementação conforme o ambiente.

    Em produção, a ausência da chave é erro de configuração e vira 503 — nunca
    um stub silencioso.
    """
    api_key = os.environ.get("OPENAI_API_KEY") or ""
    if api_key:
        return OpenAIBiblicalAssistant(api_key)

    if settings.is_production:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Chat indisponível: integração de IA não configurada.",
        )

    return StubBiblicalAssistant()
