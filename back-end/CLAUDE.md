# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos

```bash
uv sync                                  # Instalar/sincronizar dependências
uv run python -m app.core.config_check   # Validar configuração (.env)
uv run alembic upgrade head              # Aplicar migrations
uv run uvicorn app.main:app --reload     # Servidor de desenvolvimento (localhost:8000)

uv run pytest                            # Todos os testes (os de banco pulam sem TEST_DATABASE_URL)
uv run pytest tests/unit                 # Unitários — sem banco, sem rede
uv run pytest tests/integration          # Integração — exige TEST_DATABASE_URL
uv run pytest --cov                      # Com cobertura

uv run ruff check .                      # Lint
uv run black --check .                   # Formato (sem modificar)
uv run mypy app                          # Tipos — estrito nos módulos de auth
```

`uv run` ativa o `.venv` automaticamente — não é necessário ativar manualmente.

Antes de executar: copiar `.env.example` para `.env` e preencher `JWT_SECRET_KEY`
(≥ 32 caracteres — valores de exemplo são recusados na inicialização) e `DATABASE_URL`.

## Arquitetura

Monolito modular FastAPI orientado a domínios. **Estado atual: Fase 2** — autenticação
e persistência reais sobre PostgreSQL (SQLAlchemy 2 async + Alembic). O painel
therapist ainda persiste em JSON local (`data/patients.json`) e está fora da migração.

```
app/
├── main.py              # Ponto de entrada: CORS, montagem dos routers, /health
├── api/
│   ├── router.py        # Agrega todos os domínios sob /v1
│   └── v1/              # Routers finos por domínio — validam entrada, delegam ao serviço
├── core/
│   ├── config.py        # Settings validadas na inicialização (falham cedo)
│   ├── config_check.py  # python -m app.core.config_check — usado no CI
│   ├── security.py      # JWT tipado: decode_token(token, expected_type=...)
│   ├── dependencies.py  # get_current_user — valida token E usuário ativo no banco
│   ├── database.py      # Engine async + get_db (injeção de sessão)
│   ├── storage.py       # JSON local — usado apenas pelo domínio therapist e ETL runs
│   └── scraper.py       # ETL de scraping do wgospel.com/tempoderefletir/
├── domain/<domínio>/schemas.py   # Contratos Pydantic de request/response
├── models/              # SQLAlchemy: user (com RefreshToken por sessão), chat, post, library
├── repositories/        # Acesso a dados (UserRepository, ChatRepository, ...)
├── services/            # Regras de negócio (auth_service, chat_service, ...)
└── integrations/
    └── openai_client.py # BiblicalAssistant: OpenAI real + stub declarado (nunca em produção)
migrations/              # Alembic — criam o banco do zero; downgrade implementado
```

### Autenticação — invariantes

- Toda rota protegida usa `Depends(get_current_user_id)` — exige access token válido
  **e** usuário ativo no banco; refresh token em rota protegida é rejeitado (claim `type`).
- Refresh tokens: no banco só o SHA-256, agrupados por `session_id`. Rotação revoga o
  anterior; reuso de token revogado derruba a sessão inteira.
- Login retorna sempre o mesmo 401 genérico (inexistente/senha errada/desativado).
- Senhas: hash Argon2 via passlib; nunca aparecem em resposta.
- Não reintroduzir defaults de segredo em `config.py` nem mock de usuário em
  `dependencies.py`.

### Padrões de implementação

**Adicionar um novo endpoint:**
1. Definir schemas em `app/domain/<domínio>/schemas.py`
2. Modelo em `app/models/` + migration (`alembic revision --autogenerate`)
3. Repositório em `app/repositories/`, serviço em `app/services/`
4. Rota fina em `app/api/v1/<domínio>.py` usando `response_model`
5. Testes: integração (banco real) + contrato (formato)

**Testes:** os de integração usam as fixtures de `tests/conftest.py` (`client`,
`db_session`, `signup_user`, `auth_headers`) e o marcador `@pytest.mark.db`. Sem
`TEST_DATABASE_URL` eles pulam com motivo explícito; no CI `REQUIRE_DB=1` torna o
pulo uma falha. Não desabilitar testes para obter sucesso.

## Variáveis de Ambiente Relevantes

| Variável | Obrigatória | Descrição |
|---|---|---|
| `JWT_SECRET_KEY` | Sim | ≥ 32 chars; placeholders são recusados |
| `DATABASE_URL` | Sim | `postgresql+psycopg://...` (driver async) |
| `TEST_DATABASE_URL` | Para testes de banco | Banco isolado; tabelas são truncadas |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Não | Padrão: 15 |
| `JWT_REFRESH_TOKEN_EXPIRE_DAYS` | Não | Padrão: 7 |
| `OPENAI_API_KEY` | Não em dev | Sem ela: stub declarado em dev; **503 em produção** |
| `REDIS_URL` | Fase 3 | Ainda não utilizado |

## CI

`.github/workflows/backend-ci.yml`: PostgreSQL de serviço → config_check → migrations
em banco limpo (+ rollback) → Ruff → Black → mypy → pytest com `REQUIRE_DB=1` →
cobertura ≥ 80% nos módulos de auth → import da aplicação.

## Documentação Técnica

- `arquitetura-back-end.md` — decisões arquiteturais completas e roadmap de fases
- `../docs/tasks/auth-persistence-plan.md` — plano e decisões da migração de autenticação
- `docs/testes.md` — estratégia de testes
