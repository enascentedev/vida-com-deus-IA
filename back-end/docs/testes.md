# Documentação de Testes — Back-end Vida com Deus

## 1. Visão Geral

A suíte tem três camadas ativas e duas reservadas para fases futuras:

```
tests/
├── unit/         # JWT, configuração e schemas — sem banco, sem rede
├── integration/  # Auth, tokens, autorização e chat contra PostgreSQL real
├── contract/     # Status HTTP e formato de resposta (serviços mockados)
├── e2e/          # Fluxos ponta a ponta (Fase 3 — vazio)
└── load/         # Carga (Fase 4 — vazio)
```

**Estado atual:** unitários, integração e contrato implementados. Os diretórios `e2e/`
e `load/` seguem vazios — nenhum teste desses tipos existe hoje.

---

## 2. Como executar

Todos os comandos a partir de `back-end/`.

```bash
uv run pytest                      # tudo; testes de banco pulam sem TEST_DATABASE_URL
uv run pytest tests/unit -v        # só unitários
uv run pytest --cov=app --cov-report=term-missing

# Integração (exige banco isolado — nunca o de desenvolvimento)
TEST_DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/vida_com_deus_test \
  uv run pytest tests/integration -v
```

### O banco de teste

`tests/conftest.py` cria o schema aplicando as **migrations reais** (`alembic upgrade head`)
uma vez por sessão e trunca todas as tabelas entre os testes
(`TRUNCATE ... RESTART IDENTITY CASCADE`). Cada teste começa com o banco vazio.

Nenhum teste depende de serviço externo de IA: o `ChatService` recebe um assistente
injetado (`BiblicalAssistant`) nos testes, e a OpenAI nunca é chamada.

### Testes pulados nunca passam despercebidos

Testes marcados com `@pytest.mark.db` exigem `TEST_DATABASE_URL`. Sem ela, são **pulados
com motivo explícito**. No CI, `REQUIRE_DB=1` faz o mesmo caso virar **erro**: a suíte não
pode passar sem ter tocado o banco. Isso existe para que "todos os testes passaram" nunca
signifique "os testes de banco não rodaram".

---

## 3. Cobertura por camada

### 3.1 Unitários (`tests/unit/`)

| Arquivo | O que cobre |
|---|---|
| `test_security.py` | Claims do access e do refresh token (`sub`, `sid`, `type`, `exp`, `jti`); recusa de token sem `type`, com tipo trocado, expirado, assinado com outro segredo, malformado e sem `sub`; refresh recusado onde se espera access |
| `test_config.py` | Segredo curto e valores de placeholder recusados; algoritmo fora da lista permitida recusado; `DATABASE_URL` sem driver async recusada; configuração válida aceita; `is_production` |
| `test_auth_schemas.py` | Senha abaixo do mínimo e acima do máximo; email normalizado (espaços e maiúsculas); email inválido; nome vazio |
| `test_openai_client.py` | Stub declara que é simulado; produção sem chave responde 503; com chave escolhe a implementação real |

### 3.2 Integração (`tests/integration/`)

| Arquivo | O que cobre |
|---|---|
| `test_auth_signup_login.py` | Cadastro com sucesso; email duplicado (409); email normalizado no cadastro e no login; senha inválida (422); payload inválido (422); login válido; senha incorreta; usuário inexistente; resposta sem hash de senha; claims esperadas no token |
| `test_token_lifecycle.py` | Refresh válido; access usado como refresh; refresh expirado; refresh revogado; rotação; reutilização do token anterior derrubando a sessão; usuário desativado; logout; reuso após logout; idempotência do logout; `logout-all` |
| `test_authorization.py` | Ausência de token; token inválido; refresh em rota protegida; usuário acessa os próprios dados; não acessa dados de outro; conversa inexistente; mensagem em conversa de outro usuário |
| `test_chat_persistence.py` | Criação e listagem de conversa; criação de mensagem; histórico; ordem temporal; isolamento entre usuários |

### 3.3 Contrato (`tests/contract/`)

`test_endpoints.py` valida status HTTP e formato de resposta de todos os endpoints com
autenticação e serviços substituídos por fixtures. Os overrides ficam em fixture com
teardown — não vazam para os testes de integração.

---

## 4. Cobertura de código

Meta obrigatória: **≥ 80% nos módulos de autenticação e autorização**, verificada no CI:

```bash
uv run pytest \
  --cov=app.core.security --cov=app.core.dependencies --cov=app.core.config \
  --cov=app.services.auth_service --cov=app.repositories.user_repository \
  --cov=app.domain.auth --cov-fail-under=80
```

Relatório navegável: `uv run pytest --cov=app --cov-report=html` → `htmlcov/index.html`.

---

## 5. CI

`.github/workflows/backend-ci.yml` executa, contra um serviço `postgres:16`:

1. checkout → 2. uv + Python 3.13 → 3. cache → 4. serviço PostgreSQL → 5. `uv sync --frozen`
→ 6. `python -m app.core.config_check` → 7. `alembic upgrade head` e teste de rollback
→ 8. `ruff check` → 9. `black --check` → 10. `mypy app` → 11. `pytest` com `REQUIRE_DB=1`
→ 12. cobertura com `--cov-fail-under=80` → 13. import da aplicação.

O `JWT_SECRET_KEY` é gerado dentro do job; nenhum segredo real aparece no workflow.

---

## 6. O que ainda não existe

- **E2E** (`tests/e2e/`): nenhum teste. Fluxos completos com servidor real ficam para a Fase 3.
- **Carga** (`tests/load/`): nenhum teste. Ferramenta a definir (locust ou k6) na Fase 4.
- **Recuperação de senha ponta a ponta**: sem envio de email, o fluxo não é testável além
  da criação e do consumo do token.
