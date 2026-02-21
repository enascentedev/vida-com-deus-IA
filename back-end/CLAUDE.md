# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos

```bash
uv sync                                  # Instalar/sincronizar dependências
uv run uvicorn app.main:app --reload     # Servidor de desenvolvimento (localhost:8000)

pytest                                   # Todos os testes
pytest tests/contract/test_endpoints.py  # Testes de contrato
pytest tests/contract/test_endpoints.py::test_login  # Teste único
pytest --cov                             # Com cobertura
pytest -v                                # Verboso
```

`uv run` ativa o `.venv` automaticamente — não é necessário ativar manualmente.

Antes de executar: copiar `.env.example` para `.env` e definir ao menos `JWT_SECRET_KEY`.

## Arquitetura

Monolito modular FastAPI orientado a domínios. **Estado atual: Fase 1.5** — endpoints principais persistem dados em arquivos JSON locais (`data/`). Chat integrado ao GPT-4o-mini com fallback mock.

### Camadas existentes

```
app/
├── main.py              # Ponto de entrada: CORS, montagem dos routers, /health
├── api/
│   ├── router.py        # Agrega todos os domínios sob /v1
│   └── v1/              # Um arquivo por domínio (auth, users, posts, library, chat, admin, therapist)
├── core/
│   ├── config.py        # Pydantic Settings — lê variáveis do .env
│   ├── security.py      # create_access_token / create_refresh_token / decode_token (JWT)
│   ├── dependencies.py  # get_current_user_id / require_current_user_id (Depends)
│   ├── storage.py       # read_json / write_json / append_etl_run / get_etl_runs
│   └── scraper.py       # ETL de scraping do wgospel.com/tempoderefletir/
└── domain/
    └── <domínio>/
        └── schemas.py   # Schemas Pydantic de request e response do domínio
data/                    # Persistência JSON local (Fase 1.5)
├── posts.json           # Posts coletados pelo ETL
├── patients.json        # Pacientes do dashboard do psicólogo
├── favorites.json       # Favoritos da biblioteca por usuário
├── users.json           # Perfil do usuário autenticado
└── etl_runs.json        # Histórico das execuções de ETL (últimas 20)
```

### Camadas planejadas (Fase 2)

- `app/services/` — lógica de negócio
- `app/repositories/` — acesso a dados (SQLAlchemy + PostgreSQL)
- `app/workers/` — filas assíncronas (ETL, email, embeddings)
- `app/integrations/` — provedores externos (IA, storage, email)

### Padrões de implementação

**Adicionar um novo endpoint:**
1. Definir schemas em `app/domain/<domínio>/schemas.py`
2. Implementar a rota em `app/api/v1/<domínio>.py` usando `response_model`
3. Se for novo domínio, registrar o router em `app/api/router.py`
4. Adicionar caso de teste em `tests/contract/test_endpoints.py`

**Autenticação nos endpoints:**
- Sem obrigatoriedade: `user_id: str = Depends(get_current_user_id)` — aceita token inválido/ausente, retorna mock
- Com obrigatoriedade: `user_id: str = Depends(require_current_user_id)` — lança 401

**Testes de contrato (Fase 1):** usam `TestClient` do FastAPI — sem banco, sem rede. Para autenticação, passar `headers={"Authorization": "Bearer mock-token"}`.

## Variáveis de Ambiente Relevantes

| Variável | Obrigatória | Descrição |
|---|---|---|
| `JWT_SECRET_KEY` | Sim | Chave secreta JWT (trocar em produção) |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Não | Padrão: 15 |
| `JWT_REFRESH_TOKEN_EXPIRE_DAYS` | Não | Padrão: 7 |
| `OPENAI_API_KEY` | Não (fallback mock) | Chave da API OpenAI para o chat bíblico |
| `DATABASE_URL` | Fase 2 | `postgresql+psycopg://...` |
| `REDIS_URL` | Fase 2 | `redis://localhost:6379/0` |

## Documentação Técnica

- `arquitetura-back-end.md` — decisões arquiteturais completas, modelo de dados candidato, estratégia de testes e roadmap de fases
