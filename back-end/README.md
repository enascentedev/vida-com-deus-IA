# Vida com Deus — Backend

**API FastAPI orientada a domínios para a plataforma devocional Vida com Deus — autenticação JWT, feed bíblico, chat com IA e biblioteca pessoal.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Pydantic](https://img.shields.io/badge/Pydantic-v2-E92063?style=for-the-badge&logo=pydantic&logoColor=white)](https://docs.pydantic.dev/)
[![pytest](https://img.shields.io/badge/pytest-8.3-0A9EDC?style=for-the-badge&logo=pytest&logoColor=white)](https://pytest.org/)

---

## 📖 Sobre

Backend da aplicação **Vida com Deus**, construído como um monolito modular com FastAPI. A arquitetura é orientada a domínios — cada domínio de produto (autenticação, posts, chat, biblioteca, admin) vive em seu próprio router, schema e camada de serviço, permitindo evolução independente.

**Estado atual — Fase 2:** autenticação e persistência reais sobre PostgreSQL (SQLAlchemy 2 async + Alembic). Estado por categoria:

| Funcionalidade | Estado |
| --- | --- |
| Cadastro/login com hash Argon2 e sessões no banco | **Implementado** |
| Access/refresh tokens tipados, rotação, revogação e detecção de reuso | **Implementado** |
| Conversas e mensagens do chat persistidas, isoladas por usuário | **Implementado** |
| Perfil e configurações de usuário no banco | **Implementado** |
| Posts, biblioteca e métricas admin no banco | **Implementado** |
| Recuperação de senha | **Parcial** — token é criado, mas não há envio de email |
| Chat com IA (GPT-4o-mini) | **Implementado** — sem `OPENAI_API_KEY`: stub declarado em dev, 503 em produção |
| Citações extraídas da resposta real da IA | **Planejado** |
| Painel therapist | **Simulado** — persiste em JSON local (`data/patients.json`) |
| Redis / workers assíncronos | **Planejado** (Fase 3) |

---

## 🛠️ Tech Stack

| Categoria | Tecnologia |
| --------- | ---------- |
| Framework | FastAPI 0.115 (async-first, OpenAPI automático) |
| Servidor ASGI | Uvicorn (standard) |
| Validação | Pydantic v2 + pydantic-settings |
| Banco de dados | PostgreSQL — SQLAlchemy 2 (async) + psycopg 3 |
| Migrations | Alembic |
| Autenticação | JWT (python-jose) + Argon2 (passlib) |
| HTTP Client | httpx |
| Testes | pytest + pytest-asyncio + pytest-cov |
| Qualidade | Ruff (lint) + Black (formato) + mypy (tipos) |
| Gerenciador de pacotes | uv |
| Python | 3.13 |
| Cache | Redis (Fase 3 — ainda não utilizado) |

---

## 🏗️ Arquitetura

```text
back-end/
├── app/
│   ├── main.py              # FastAPI app — CORS, routers, health check
│   ├── api/
│   │   ├── router.py        # Agrega todos os routers sob /v1
│   │   └── v1/              # Routers finos: validam entrada e delegam aos serviços
│   ├── core/
│   │   ├── config.py        # Settings validadas na inicialização (segredo forte obrigatório)
│   │   ├── config_check.py  # `python -m app.core.config_check` — passo de CI
│   │   ├── security.py      # JWT tipado (access/refresh) com claim de sessão
│   │   ├── dependencies.py  # get_current_user — valida token e usuário ativo no banco
│   │   └── database.py      # Engine async + injeção de sessão (get_db)
│   ├── domain/              # Schemas Pydantic por domínio (contratos da API)
│   ├── models/              # SQLAlchemy: users, refresh_tokens (sessões), chat, posts...
│   ├── repositories/        # Acesso a dados
│   ├── services/            # Regras de negócio (auth_service, chat_service...)
│   └── integrations/
│       └── openai_client.py # Assistente bíblico: implementação real + stub declarado
├── migrations/              # Alembic — criam o banco do zero, com downgrade
└── tests/
    ├── unit/                # JWT, config, schemas — sem banco nem rede
    ├── integration/         # Auth, tokens, autorização e chat contra PostgreSQL real
    └── contract/            # Status HTTP e formato de resposta (serviços mockados)
```

---

## 🔌 Endpoints

### Health

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| `GET` | `/health` | Status da API e versão |

### Auth — `/v1/auth`

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| `POST` | `/signup` | Criar conta (senha ≥ 8 caracteres; email normalizado) |
| `POST` | `/login` | Login com e-mail e senha — abre uma sessão |
| `POST` | `/refresh` | Rotaciona o par de tokens (o refresh anterior é revogado) |
| `POST` | `/logout` | Revoga a sessão (refresh token no body ou access token no header) |
| `POST` | `/logout-all` | Revoga todas as sessões do usuário autenticado |
| `POST` | `/forgot-password` | Iniciar recuperação de senha (**parcial** — sem envio de email) |
| `POST` | `/reset-password` | Concluir redefinição de senha (revoga todas as sessões) |

#### Fluxo de autenticação

1. `signup`/`login` devolvem `{access_token, refresh_token}`. O access token expira em 15 min e só ele é aceito nas rotas protegidas (`Authorization: Bearer ...`).
2. Quando o access expira, o cliente chama `refresh` com o refresh token. O servidor **rotaciona**: emite um par novo e revoga o refresh usado.
3. Reapresentar um refresh já revogado é tratado como reuso — **a sessão inteira é derrubada**.
4. `logout` revoga a sessão no servidor; apagar o token no cliente não basta.
5. No banco ficam apenas hashes SHA-256 dos refresh tokens — nunca o token puro. Senhas são armazenadas somente como hash Argon2.

### Usuário — `/v1/users`

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| `GET` | `/me` | Perfil do usuário atual |
| `PATCH` | `/me` | Atualizar perfil |
| `GET` | `/me/settings` | Configurações do usuário |
| `PATCH` | `/me/settings` | Atualizar configurações |

### Posts — `/v1/posts`

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| `GET` | `/feed` | Post do dia + posts recentes |
| `GET` | `/` | Listar posts (busca e filtros) |
| `GET` | `/{post_id}` | Detalhe completo do post |
| `GET` | `/{post_id}/audio` | Informações do áudio |

### Biblioteca — `/v1/library`

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| `GET` | `/` | Favoritos ou histórico (`?tab=favorites\|history`) |
| `POST` | `/favorites/{post_id}` | Adicionar aos favoritos |
| `DELETE` | `/favorites/{post_id}` | Remover dos favoritos |
| `POST` | `/history` | Registrar visualização |

### Chat — `/v1/chat`

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| `POST` | `/conversations` | Criar conversa |
| `GET` | `/conversations` | Listar conversas do usuário |
| `GET` | `/conversations/{id}/messages` | Buscar mensagens |
| `POST` | `/conversations/{id}/messages` | Enviar mensagem |

### Therapist — `/v1/therapist`

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| `GET` | `/overview` | Visão geral do dashboard |
| `GET` | `/patients` | Listar pacientes (resumo) |
| `POST` | `/patients` | Cadastrar paciente (intake) |
| `GET` | `/patients/{id}` | Ficha completa do paciente |
| `PATCH` | `/patients/{id}` | Atualizar dados clínicos/diretrizes |
| `PATCH` | `/patients/{id}/status` | Alterar status (active/paused/discharged) |
| `PATCH` | `/patients/{id}/limit` | Ajustar limite de mensagens |
| `GET` | `/patients/{id}/sessions` | Listar sessões do paciente |
| `POST` | `/patients/{id}/sessions` | Registrar nova sessão |
| `PATCH` | `/patients/{id}/sessions/{sid}` | Editar sessão existente |

### Admin — `/v1/admin`

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| `GET` | `/metrics/storage` | Uso de armazenamento |
| `GET` | `/metrics/growth` | Crescimento (últimos 7 dias) |
| `GET` | `/etl/runs` | Histórico de execuções ETL |
| `POST` | `/etl/runs/execute` | Disparar job ETL |
| `GET` | `/alerts` | Alertas do sistema |

---

## 🚀 Instalação

### Pré-requisitos

- Python 3.13
- [uv](https://docs.astral.sh/uv/) — `pip install uv`
- PostgreSQL 14+ em execução

### Passos

```bash
# Instalar dependências e criar .venv
uv sync

# Criar os bancos (desenvolvimento e testes)
createdb vida_com_deus
createdb vida_com_deus_test

# Configurar variáveis de ambiente
cp .env.example .env
# Preencha JWT_SECRET_KEY (obrigatório — gere com o comando abaixo) e DATABASE_URL
python -c "import secrets; print(secrets.token_urlsafe(48))"

# Conferir a configuração (o mesmo passo roda no CI)
uv run python -m app.core.config_check

# Aplicar as migrations (criam o banco do zero)
uv run alembic upgrade head

# Iniciar servidor de desenvolvimento (uv run ativa o .venv automaticamente)
uv run uvicorn app.main:app --reload
```

A aplicação **não sobe** com `JWT_SECRET_KEY` ausente, curto ou com valor de exemplo — isso é intencional.

### Migrations

```bash
uv run alembic upgrade head        # aplica tudo
uv run alembic downgrade -1        # desfaz a última
uv run alembic revision --autogenerate -m "descricao"   # nova migration
```

A API estará disponível em:

- **API:** `http://localhost:8000`
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## 🧪 Testes

A suíte tem três camadas:

- `tests/unit` — JWT, validação de configuração e schemas. Sem banco, sem rede.
- `tests/integration` — cadastro, login, ciclo de vida de tokens, autorização e persistência do chat contra um **PostgreSQL real**. Exigem `TEST_DATABASE_URL` apontando para um banco isolado (as tabelas são truncadas entre os testes — nunca use o banco de desenvolvimento).
- `tests/contract` — status HTTP e formato de resposta, com serviços mockados.

```bash
uv run pytest                     # tudo (testes de banco são pulados sem TEST_DATABASE_URL)
uv run pytest tests/unit          # só unitários
TEST_DATABASE_URL=postgresql+psycopg://user:pass@localhost:5432/vida_com_deus_test \
  uv run pytest tests/integration # integração contra banco real
uv run pytest --cov               # com cobertura
```

Sem `TEST_DATABASE_URL`, os testes de integração são **pulados com motivo explícito** — nunca silenciosamente. No CI, `REQUIRE_DB=1` transforma esse pulo em falha: a suíte só passa tendo tocado o banco.

Qualidade de código:

```bash
uv run ruff check .       # lint
uv run black --check .    # formato (sem modificar)
uv run mypy app           # tipos — estrito nos módulos de autenticação
```

---

## ⚙️ Variáveis de Ambiente

| Variável | Padrão | Descrição |
| -------- | ------ | --------- |
| `APP_NAME` | `Vida com Deus API` | Nome da aplicação |
| `DEBUG` | `false` | Modo de depuração |
| `ENVIRONMENT` | `development` | `development` \| `staging` \| `production` |
| `CORS_ORIGINS` | `["http://localhost:5173", ...]` | Origens permitidas (lista JSON) |
| `JWT_SECRET_KEY` | — | **Obrigatório.** ≥ 32 caracteres; valores de exemplo são recusados |
| `JWT_ALGORITHM` | `HS256` | Permitidos: HS256, HS384, HS512 |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | `15` | Validade do access token |
| `JWT_REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Validade do refresh token |
| `DATABASE_URL` | — | **Obrigatório.** `postgresql+psycopg://user:pass@host:5432/banco` |
| `TEST_DATABASE_URL` | — | Banco isolado para a suíte de testes |
| `OPENAI_API_KEY` | — | Chat com IA; sem ela: stub declarado em dev, 503 em produção |
| `RENDER_DB_SIZE_BYTES` | `1073741824` | Tamanho do plano de banco (métricas admin) |
| `REDIS_URL` | — | Redis (Fase 3 — ainda não utilizado) |

O CI (`.github/workflows/backend-ci.yml`) sobe um PostgreSQL de serviço, valida a configuração, aplica as migrations em banco limpo (com teste de rollback), roda Ruff, Black, mypy e a suíte completa com `REQUIRE_DB=1` e cobertura mínima de 80% nos módulos de autenticação/autorização.

---

## 📚 Documentação Técnica

A arquitetura detalhada, decisões técnicas, contratos de API e estratégia de testes estão documentados em [`arquitetura-back-end.md`](arquitetura-back-end.md).

---

Construído com ☕ e fé — **[Vida com Deus](../)**.
