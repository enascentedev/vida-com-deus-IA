# Documentação de Testes — Back-end Vida com Deus

## 1. Visão Geral

O back-end adota uma estratégia de testes em camadas, organizada em cinco tipos distintos. Cada tipo cobre um nível diferente da aplicação e é executado em momentos específicos do ciclo de desenvolvimento.

```
tests/
├── contract/     # Testes de contrato — status HTTP e schemas de resposta
├── unit/         # Testes unitários — regras de negócio isoladas
├── integration/  # Testes de integração — API + banco + cache
├── e2e/          # Testes de ponta a ponta — fluxos completos do usuário
└── load/         # Testes de carga — comportamento sob pico de requisições
```

**Estado atual:** Fase 1 concluída. Apenas os testes de contrato estão implementados. Os demais diretórios estão preparados para as fases seguintes.

---

## 2. Ferramentas e Configuração

### Dependências de teste (`pyproject.toml`)

| Pacote | Versão mínima | Função |
|--------|---------------|--------|
| `pytest` | 8.3.0 | Runner principal |
| `pytest-asyncio` | 0.24.0 | Suporte a testes assíncronos |
| `pytest-cov` | 5.0.0 | Relatório de cobertura |
| `httpx` | 0.27.0 | Cliente HTTP para TestClient |

### Configuração do pytest (`pyproject.toml`)

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

- `asyncio_mode = "auto"` — todos os testes `async def` são detectados automaticamente.
- `testpaths = ["tests"]` — o pytest busca testes apenas dentro da pasta `tests/`.

---

## 3. Como Executar os Testes

O projeto usa `uv` para gerenciar o ambiente virtual. Todos os comandos devem ser executados a partir da pasta `back-end/`.

### Executar tudo

```bash
uv run pytest
```

### Executar apenas os testes de contrato

```bash
uv run pytest tests/contract -v
```

### Executar com relatório de cobertura

```bash
uv run pytest --cov=app --cov-report=term-missing
```

### Executar um único arquivo de teste

```bash
uv run pytest tests/contract/test_endpoints.py -v
```

### Executar um único teste pelo nome

```bash
uv run pytest tests/contract/test_endpoints.py::test_login -v
```

### Flags úteis

| Flag | Efeito |
|------|--------|
| `-v` | Exibe o nome de cada teste (modo verbose) |
| `-s` | Exibe prints e logs durante os testes |
| `--tb=short` | Traceback resumido em falhas |
| `--tb=long` | Traceback completo em falhas |
| `-x` | Para na primeira falha |
| `-k "nome"` | Filtra testes pelo nome |

---

## 4. Testes de Contrato (Fase 1 — implementados)

**Arquivo:** `tests/contract/test_endpoints.py`

**Objetivo:** Garantir que todos os endpoints retornam o status HTTP correto e que os schemas de resposta contêm os campos esperados pelo front-end. Não há banco de dados nem serviços externos envolvidos — todos os endpoints retornam dados mockados.

**Mecanismo:** Usa `fastapi.testclient.TestClient`, que executa a aplicação em memória sem abrir um servidor real.

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
AUTH_HEADER = {"Authorization": "Bearer mock-token"}
```

O header `Authorization: Bearer mock-token` é aceito por todos os endpoints protegidos na Fase 1 (a validação real de JWT é implementada na Fase 2).

### 4.1 Cobertura dos testes

#### Health

| Teste | Endpoint | Status esperado | Campos verificados |
|-------|----------|-----------------|-------------------|
| `test_health` | `GET /health` | 200 | `status`, `version` |

#### Auth

| Teste | Endpoint | Status esperado | Campos verificados |
|-------|----------|-----------------|-------------------|
| `test_signup` | `POST /v1/auth/signup` | 201 | `access_token`, `refresh_token`, `token_type` |
| `test_login` | `POST /v1/auth/login` | 200 | `access_token`, `refresh_token` |
| `test_refresh` | `POST /v1/auth/refresh` | 200 | `access_token` |
| `test_forgot_password` | `POST /v1/auth/forgot-password` | 200 | `message` |
| `test_reset_password` | `POST /v1/auth/reset-password` | 200 | `message` |
| `test_logout` | `POST /v1/auth/logout` | 200 | `message` |

#### Usuários

| Teste | Endpoint | Status esperado | Campos verificados |
|-------|----------|-----------------|-------------------|
| `test_get_me` | `GET /v1/users/me` | 200 | `id`, `name`, `email` |
| `test_update_me` | `PATCH /v1/users/me` | 200 | `name` (valor enviado) |
| `test_get_settings` | `GET /v1/users/me/settings` | 200 | `theme`, `ai_insights`, `biblical_reminders`, `rag_memory` |
| `test_update_settings` | `PATCH /v1/users/me/settings` | 200 | `theme` (valor enviado) |

#### Posts

| Teste | Endpoint | Status esperado | Campos verificados |
|-------|----------|-----------------|-------------------|
| `test_get_feed` | `GET /v1/posts/feed` | 200 | `post_of_day`, `recent_posts` (lista) |
| `test_list_posts` | `GET /v1/posts` | 200 | lista de posts |
| `test_list_posts_with_query` | `GET /v1/posts?query=Paz` | 200 | todos os resultados contêm "Paz" no título |
| `test_get_post_detail` | `GET /v1/posts/post-001` | 200 | `title`, `verse_content`, `ai_summary`, `tags`, `key_points` |
| `test_get_post_audio` | `GET /v1/posts/post-001/audio` | 200 | `url`, `duration` |

#### Biblioteca

| Teste | Endpoint | Status esperado | Campos verificados |
|-------|----------|-----------------|-------------------|
| `test_get_favorites` | `GET /v1/library?tab=favorites` | 200 | `items` (lista), `total` |
| `test_get_history` | `GET /v1/library?tab=history` | 200 | `items` (lista) |
| `test_add_favorite` | `POST /v1/library/favorites/post-001` | 201 | `is_favorited: true`, `post_id` |
| `test_remove_favorite` | `DELETE /v1/library/favorites/post-001` | 200 | `is_favorited: false` |
| `test_record_history` | `POST /v1/library/history` | 201 | `message` |

#### Chat

| Teste | Endpoint | Status esperado | Campos verificados |
|-------|----------|-----------------|-------------------|
| `test_create_conversation` | `POST /v1/chat/conversations` | 201 | `id`, `user_id` |
| `test_list_conversations` | `GET /v1/chat/conversations` | 200 | `conversations` |
| `test_get_messages` | `GET /v1/chat/conversations/conv-001/messages` | 200 | `conversation_id`, `messages` (pelo menos 1, com `role` válido) |
| `test_send_message` | `POST /v1/chat/conversations/conv-001/messages` | 201 | `user_message`, `assistant_message` (com `role: assistant` e `citations`) |

#### Admin

| Teste | Endpoint | Status esperado | Campos verificados |
|-------|----------|-----------------|-------------------|
| `test_get_storage_metrics` | `GET /v1/admin/metrics/storage` | 200 | `usage_percent`, `used_gb`, `total_gb` |
| `test_get_growth_metrics` | `GET /v1/admin/metrics/growth` | 200 | `percentage`, `history` (7 itens) |
| `test_get_etl_runs` | `GET /v1/admin/etl/runs` | 200 | `runs` (pelo menos 1, com `status` válido) |
| `test_execute_etl` | `POST /v1/admin/etl/runs/execute` | 202 | `run_id`, `status: running` |
| `test_get_alerts` | `GET /v1/admin/alerts` | 200 | `alerts` (pelo menos 1, com `level` válido) |

**Total: 26 testes cobrindo todos os endpoints do MVP.**

---

## 5. Testes Unitários (Fase 2 — planejados)

**Diretório:** `tests/unit/`

**Objetivo:** Testar regras de negócio isoladas, sem dependência de banco, HTTP ou serviços externos.

### O que será testado

- `app/core/security.py` — criação e validação de JWT (access e refresh token)
- `app/core/security.py` — hash e verificação de senha
- Lógica de filtragem e ordenação de posts
- Regras de negócio da biblioteca (impedir duplicata de favorito, etc.)
- Formatação de respostas do chat

### Exemplo de estrutura esperada

```
tests/unit/
├── test_security.py       # JWT, hash de senha
├── test_posts_logic.py    # Ordenação, filtragem
└── test_library_logic.py  # Regras de favoritos
```

---

## 6. Testes de Integração (Fase 2 — planejados)

**Diretório:** `tests/integration/`

**Objetivo:** Validar a comunicação entre as camadas da aplicação (API → service → repository → banco de dados).

**Pré-requisitos:** PostgreSQL e Redis rodando (via Docker Compose ou instâncias locais). Banco de teste separado do banco de desenvolvimento.

### O que será testado

- Persistência e leitura de usuários no PostgreSQL
- Cache de feed no Redis
- Fluxo completo de auth (signup → login → refresh → logout) com dados reais no banco
- Adição e remoção de favoritos com validação no banco

### Convenção de setup

Cada teste de integração deve usar uma fixture que cria um banco isolado e o limpa após o teste.

---

## 7. Testes E2E (Fase 3 — planejados)

**Diretório:** `tests/e2e/`

**Objetivo:** Simular fluxos completos do usuário de ponta a ponta, com servidor rodando e banco real.

### Fluxos mínimos obrigatórios (definidos na arquitetura)

1. Cadastro → login → acesso ao feed
2. Recuperação de senha (forgot → reset → login)
3. Leitura de post detalhado
4. Adição e remoção de favorito
5. Envio de mensagem no chat e retorno com citações bíblicas
6. Consulta ao painel admin com autenticação de perfil admin

---

## 8. Testes de Carga (Fase 4 — planejados)

**Diretório:** `tests/load/`

**Objetivo:** Validar o comportamento da API sob pico de requisições.

### Metas de performance (definidas na arquitetura)

| Cenário | Meta |
|---------|------|
| p95 de endpoints de leitura (sem IA) | < 300ms |
| p95 de endpoints de auth | < 400ms |
| Taxa de erro HTTP 5xx | < 1% |
| Disponibilidade alvo | ≥ 99,5% |

### Ferramenta sugerida

`locust` ou `k6` — a definir na Fase 4.

---

## 9. Cobertura de Código

Para gerar o relatório de cobertura:

```bash
uv run pytest --cov=app --cov-report=term-missing
```

Para gerar relatório HTML navegável:

```bash
uv run pytest --cov=app --cov-report=html
# Abre htmlcov/index.html no browser
```

Meta de cobertura para Fase 2: **≥ 80%** nas camadas `services/` e `core/`.

---

## 10. Roadmap de Testes por Fase

| Fase | Testes ativos | Objetivo |
|------|---------------|---------|
| **Fase 1** (atual) | Contrato | Validar que todos os endpoints existem e retornam schemas corretos |
| **Fase 2** | + Unitários + Integração | Cobrir regras de negócio e persistência no PostgreSQL |
| **Fase 3** | + E2E | Validar fluxos completos com integração de IA |
| **Fase 4** | + Carga | Garantir performance e estabilidade em produção |
