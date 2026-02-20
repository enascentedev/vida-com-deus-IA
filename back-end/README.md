# Vida com Deus — Backend

**API FastAPI orientada a domínios para a plataforma devocional Vida com Deus — autenticação JWT, feed bíblico, chat com IA e biblioteca pessoal.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Pydantic](https://img.shields.io/badge/Pydantic-v2-E92063?style=for-the-badge&logo=pydantic&logoColor=white)](https://docs.pydantic.dev/)
[![pytest](https://img.shields.io/badge/pytest-8.3-0A9EDC?style=for-the-badge&logo=pytest&logoColor=white)](https://pytest.org/)

---

## 📖 Sobre

Backend da aplicação **Vida com Deus**, construído como um monolito modular com FastAPI. A arquitetura é orientada a domínios — cada domínio de produto (autenticação, posts, chat, biblioteca, admin) vive em seu próprio router, schema e camada de serviço, permitindo evolução independente.

**Estado atual — Fase 1:** todos os endpoints estão implementados e documentados, retornando dados mockados. A integração com banco de dados (PostgreSQL) e cache (Redis) está planejada para a Fase 2.

---

## 🛠️ Tech Stack

| Categoria | Tecnologia |
| --------- | ---------- |
| Framework | FastAPI 0.115 (async-first, OpenAPI automático) |
| Servidor ASGI | Uvicorn (standard) |
| Validação | Pydantic v2 + pydantic-settings |
| Autenticação | JWT — python-jose[cryptography] |
| HTTP Client | httpx |
| Testes | pytest + pytest-asyncio + pytest-cov |
| Gerenciador de pacotes | uv |
| Python | 3.13 |
| Banco de dados | PostgreSQL (Fase 2) |
| Cache | Redis (Fase 2) |

---

## 🏗️ Arquitetura

```text
back-end/
├── app/
│   ├── main.py              # FastAPI app — CORS, routers, health check
│   ├── api/
│   │   ├── router.py        # Agrega todos os routers sob /v1
│   │   └── v1/
│   │       ├── auth.py      # Cadastro, login, refresh, logout, senha
│   │       ├── users.py     # Perfil e configurações do usuário
│   │       ├── posts.py     # Feed, detalhe de post, áudio
│   │       ├── library.py   # Favoritos e histórico
│   │       ├── chat.py      # Conversas e mensagens com IA
│   │       └── admin.py     # Métricas, ETL e alertas
│   ├── core/
│   │   ├── config.py        # Pydantic Settings — lê variáveis do .env
│   │   ├── security.py      # Geração e validação de tokens JWT
│   │   └── dependencies.py  # Dependências FastAPI (Depends)
│   └── domain/
│       ├── auth/schemas.py
│       ├── users/schemas.py
│       ├── posts/schemas.py
│       ├── library/schemas.py
│       ├── chat/schemas.py
│       └── admin/schemas.py
└── tests/
    └── contract/
        └── test_endpoints.py  # 40+ casos de teste de contrato
```

**Camadas planejadas para Fase 2:**

- `app/services/` — lógica de negócio
- `app/repositories/` — acesso a dados (PostgreSQL via SQLAlchemy)
- `app/workers/` — tarefas assíncronas (e-mail, ETL)
- `app/integrations/` — provedores externos (IA, armazenamento)

---

## 🔌 Endpoints

### Health

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| `GET` | `/health` | Status da API e versão |

### Auth — `/v1/auth`

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| `POST` | `/signup` | Criar conta |
| `POST` | `/login` | Login com e-mail e senha |
| `POST` | `/refresh` | Renovar par de tokens |
| `POST` | `/logout` | Encerrar sessão |
| `POST` | `/forgot-password` | Iniciar recuperação de senha |
| `POST` | `/reset-password` | Concluir redefinição de senha |

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

### Passos

```bash
# Instalar dependências e criar .venv
uv sync

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com seus valores (especialmente JWT_SECRET_KEY)

# Iniciar servidor de desenvolvimento (uv run ativa o .venv automaticamente)
uv run uvicorn app.main:app --reload
```

A API estará disponível em:

- **API:** `http://localhost:8000`
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## 🧪 Testes

```bash
pytest                    # Todos os testes
pytest tests/contract     # Testes de contrato da API
pytest --cov              # Com relatório de cobertura
pytest -v                 # Modo verboso
```

Os testes de contrato (Fase 1) validam status HTTP e schemas de resposta para todos os endpoints usando `TestClient` do FastAPI — sem dependência de banco de dados.

---

## ⚙️ Variáveis de Ambiente

| Variável | Padrão | Descrição |
| -------- | ------ | --------- |
| `APP_NAME` | `Vida com Deus API` | Nome da aplicação |
| `DEBUG` | `false` | Modo de depuração |
| `ENVIRONMENT` | `development` | Ambiente atual |
| `CORS_ORIGINS` | `["http://localhost:5173"]` | Origens permitidas |
| `JWT_SECRET_KEY` | — | **Obrigatório.** Chave secreta JWT |
| `JWT_ALGORITHM` | `HS256` | Algoritmo de assinatura JWT |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | `15` | Validade do access token |
| `JWT_REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Validade do refresh token |
| `DATABASE_URL` | — | PostgreSQL (Fase 2) |
| `REDIS_URL` | — | Redis (Fase 2) |

---

## 📚 Documentação Técnica

A arquitetura detalhada, decisões técnicas, contratos de API e estratégia de testes estão documentados em [`arquitetura-back-end.md`](arquitetura-back-end.md).

---

Construído com ☕ e fé — **[Vida com Deus](../)**.
