"""Integração: persistência de conversas e mensagens no PostgreSQL."""

import pytest

from app.integrations.openai_client import STUB_PREFIX
from tests.conftest import auth_headers, signup_user

pytestmark = pytest.mark.db


@pytest.fixture(autouse=True)
def _sem_openai(monkeypatch: pytest.MonkeyPatch) -> None:
    """Garante o assistente stub — nenhum teste toca a rede."""
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)


async def test_criar_e_listar_conversa(client):
    tokens, _, _ = await signup_user(client)

    r = await client.post("/v1/chat/conversations", headers=auth_headers(tokens))
    assert r.status_code == 201
    conv = r.json()
    assert conv["message_count"] == 0

    r_list = await client.get("/v1/chat/conversations", headers=auth_headers(tokens))
    assert r_list.status_code == 200
    ids = [c["id"] for c in r_list.json()["conversations"]]
    assert conv["id"] in ids


async def test_mensagem_do_usuario_e_resposta_sao_persistidas(client):
    tokens, _, _ = await signup_user(client)
    conv_id = (await client.post("/v1/chat/conversations", headers=auth_headers(tokens))).json()[
        "id"
    ]

    r = await client.post(
        f"/v1/chat/conversations/{conv_id}/messages",
        json={"content": "O que a Bíblia diz sobre esperança?"},
        headers=auth_headers(tokens),
    )
    assert r.status_code == 201
    body = r.json()
    assert body["user_message"]["role"] == "user"
    assert body["assistant_message"]["role"] == "assistant"
    # Sem OPENAI_API_KEY a resposta vem do stub — e diz isso no próprio texto.
    assert body["assistant_message"]["content"].startswith(STUB_PREFIX)

    # As duas mensagens sobrevivem a uma nova leitura — persistência real.
    r_hist = await client.get(
        f"/v1/chat/conversations/{conv_id}/messages", headers=auth_headers(tokens)
    )
    assert r_hist.status_code == 200
    mensagens = r_hist.json()["messages"]
    assert len(mensagens) == 2


async def test_historico_preserva_ordem_temporal(client):
    tokens, _, _ = await signup_user(client)
    conv_id = (await client.post("/v1/chat/conversations", headers=auth_headers(tokens))).json()[
        "id"
    ]

    perguntas = ["primeira pergunta", "segunda pergunta", "terceira pergunta"]
    for pergunta in perguntas:
        r = await client.post(
            f"/v1/chat/conversations/{conv_id}/messages",
            json={"content": pergunta},
            headers=auth_headers(tokens),
        )
        assert r.status_code == 201

    r_hist = await client.get(
        f"/v1/chat/conversations/{conv_id}/messages", headers=auth_headers(tokens)
    )
    mensagens = r_hist.json()["messages"]
    assert len(mensagens) == 6  # 3 pares usuário/assistente

    do_usuario = [m["content"] for m in mensagens if m["role"] == "user"]
    assert do_usuario == perguntas

    criacoes = [m["created_at"] for m in mensagens]
    assert criacoes == sorted(criacoes)


async def test_conversas_de_usuarios_diferentes_sao_isoladas(client):
    tokens_a, _, _ = await signup_user(client)
    tokens_b, _, _ = await signup_user(client)

    conv_a = (await client.post("/v1/chat/conversations", headers=auth_headers(tokens_a))).json()[
        "id"
    ]
    conv_b = (await client.post("/v1/chat/conversations", headers=auth_headers(tokens_b))).json()[
        "id"
    ]

    await client.post(
        f"/v1/chat/conversations/{conv_a}/messages",
        json={"content": "mensagem de A"},
        headers=auth_headers(tokens_a),
    )

    r_b = await client.get(
        f"/v1/chat/conversations/{conv_b}/messages", headers=auth_headers(tokens_b)
    )
    assert r_b.json()["messages"] == []

    lista_b = (await client.get("/v1/chat/conversations", headers=auth_headers(tokens_b))).json()[
        "conversations"
    ]
    assert [c["id"] for c in lista_b] == [conv_b]
