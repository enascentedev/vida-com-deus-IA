# Decisões Arquiteturais — Fase 2 (PostgreSQL)

Data: 2026-02-21
Responsável: Emanuel

## Contexto

A Fase 1.5 entregou todos os endpoints funcionais com persistência em arquivos JSON locais (`data/*.json`). A Fase 2 substitui essa persistência por PostgreSQL real, implementa as camadas `service` e `repository`, e ativa autenticação real com senhas hasheadas. Redis e filas assíncronas ficam para a Fase 3.

---

## Decisão 1: ORM — SQLAlchemy 2.0 async

**Escolha:** `sqlalchemy[asyncio]` + `psycopg[binary]`

**Por quê:**

SQLAlchemy 2.0 introduziu a API `mapped_column` com type hints nativos, tornando o código mais legível sem perder o controle sobre o mapeamento objeto-relacional. A separação explícita entre modelo (tabela) e schema Pydantic (API) é uma vantagem intencional — evita o problema de expor campos internos (ex.: `hashed_password`) sem perceber.

SQLModel foi descartado porque, apesar da sua integração nativa com FastAPI e Pydantic v2, o projeto já usa schemas Pydantic independentes por domínio (`app/domain/*/schemas.py`). Fundir modelo e schema numa mesma classe criaria divergências conforme as tabelas ficassem mais ricas que os contratos da API — o que é esperado em projetos com dados relacionais complexos.

O modo **async** é essencial para o FastAPI: permite que a API continue respondendo a outras requisições enquanto aguarda queries lentas ou conexões sob carga, sem bloquear o event loop.

**Dependências adicionadas:**
- `sqlalchemy>=2.0` com suporte asyncio
- `psycopg[binary]>=3.1` (driver async nativo para PostgreSQL — não o psycopg2 legado)
- `alembic>=1.13`

---

## Decisão 2: Redis — adiado para Fase 3

**Escolha:** Redis não entra na Fase 2.

**Por quê:**

Redis resolve problemas de _performance_ (cache) e _conveniência_ (TTL nativo para tokens), não problemas funcionais. O app funciona corretamente sem ele — apenas com menos performance sob carga alta.

Incluir Redis na Fase 2 aumentaria o escopo de infraestrutura sem entregar funcionalidade nova ao usuário. Todos os dados reais estariam em PostgreSQL, que já é suficiente para as operações atuais. O Redis será introduzido na Fase 3 junto com os workers assíncronos, onde faz sentido como parte de uma entrega coesa de performance e processamento em background.

**O que será feito no lugar:**
- Refresh tokens armazenados na tabela `refresh_tokens` no PostgreSQL.
- Sem cache de feed por ora — cada requisição consulta o banco diretamente.

---

## Decisão 3: Hash de Senha — Argon2

**Escolha:** `passlib[argon2]`

**Por quê:**

Argon2 foi o vencedor da Password Hashing Competition (2015) e é considerado o estado da arte em hashing de senhas. Ele é configurável em três dimensões — tempo de CPU, uso de memória e paralelismo — o que o torna resistente tanto a ataques por força bruta em CPU quanto a ataques com hardware especializado (GPUs, ASICs).

bcrypt é uma alternativa sólida e com histórico de décadas, mas foi projetado antes das GPUs modernas. A diferença prática para este projeto é pequena agora, mas Argon2 é a escolha correta para novas aplicações que lidam com dados sensíveis.

`passlib` abstrai a API de hashing para que a troca de algoritmo no futuro seja trivial (só mudar o `CryptContext`).

---

## Decisão 4: Testes de Integração — testcontainers

**Escolha:** `testcontainers-python` com PostgreSQL

**Por quê:**

Testes de integração precisam de um banco real para validar comportamento de queries, constraints, transações e índices. Três opções foram avaliadas:

- **SQLite em teste**: descartado. SQLite tem diferenças de comportamento relevantes (sem suporte a `RETURNING`, JSON, tipos específicos do PostgreSQL). Testes passariam mas bugs apareceriam em produção.
- **PostgreSQL local**: exige instalação e configuração manual em cada ambiente de desenvolvimento e no CI. Risco de estado sujo entre execuções se o banco não for limpo corretamente.
- **testcontainers**: sobe um container Docker de PostgreSQL isolado antes dos testes e o destrói ao final. Cada suite começa com estado zero garantido. Portável entre máquinas e funciona no CI sem configuração adicional além do Docker.

A dependência de ter Docker instalado é aceitável — Docker já é parte do workflow de desenvolvimento moderno e será necessário na Fase 3 para Redis.

**Dependências de teste adicionadas:**
- `testcontainers[postgres]`
- `pytest-asyncio`

---

## Decisão 5: Domínios — todos em paralelo

**Escolha:** Implementar todos os domínios na mesma branch, com sequência interna controlada.

**Por quê:**

Os dados atuais são todos falsos (JSON seed). Não há usuários reais, posts proprietários ou histórico a preservar. Isso elimina o risco de regressão por migração incremental e permite tratar a Fase 2 como uma substituição limpa da camada de persistência.

**Sequência de execução:**

```
[A] Infraestrutura          → Base SQLAlchemy, Alembic, session factory, dependência de DB
      ↓
[B1] Auth + Users           → User, RefreshToken, UserSettings — em paralelo com B2
[B2] Posts                  → Post, PostTag — em paralelo com B1
      ↓
[C1] Library                → Favorite, History — depende de User (B1) e Post (B2)
[C2] Chat                   → Conversation, Message — depende de User (B1)
      ↓
[D] Testes de Integração    → testcontainers, fixtures, cobertura das camadas service/repository
```

Os domínios B1 e B2 são independentes entre si e podem ser desenvolvidos em paralelo após a infra estar pronta. O mesmo vale para C1 e C2 entre si, desde que B1 e B2 estejam concluídos.

---

## Decisão 6: Dados — base zerada

**Escolha:** Iniciar o banco PostgreSQL sem migração dos dados JSON.

**Por quê:**

Todos os dados em `data/*.json` são artificiais — gerados por seeds, mocks e um ETL que pode ser re-executado. Não há perda de informação real. Migrar esses dados para o PostgreSQL criaria trabalho extra sem valor: mapeamento de IDs, validação de integridade referencial, conversão de tipos.

**O que acontece com cada arquivo JSON:**
- `posts.json` — re-populado pelo ETL de scraping (`POST /v1/admin/etl/runs/execute`) após o banco estar pronto.
- `users.json` — descartado. O usuário de teste será recriado via `POST /v1/auth/signup`.
- `favorites.json` — descartado. Recriado manualmente durante os testes.
- `patients.json` — descartado. Dashboard do terapeuta com banco limpo.
- `etl_runs.json` — descartado. Histórico de runs será guardado na tabela `etl_runs`.

O diretório `data/` pode ser mantido durante a transição como fallback de leitura (se o banco não tiver posts, exibe o JSON) e removido após a Fase 2 estar estável.

---

## Resumo das dependências adicionadas

```toml
# pyproject.toml — Fase 2
[project.dependencies]
sqlalchemy = { version = ">=2.0", extras = ["asyncio"] }
psycopg = { version = ">=3.1", extras = ["binary"] }
alembic = ">=1.13"
passlib = { version = ">=1.7", extras = ["argon2"] }

[project.optional-dependencies]
test = [
    "testcontainers[postgres]>=4.0",
    "pytest-asyncio>=0.24",
]
```

---

## Definição de pronto para a Fase 2

- [ ] Banco PostgreSQL acessível via `DATABASE_URL` no `.env`
- [ ] Todas as migrations aplicadas com `alembic upgrade head`
- [ ] Testes de contrato continuam passando (sem regressão)
- [ ] Testes unitários cobrindo `security.py` (Argon2 hash, JWT)
- [ ] Testes de integração cobrindo o fluxo completo de auth (signup → login → refresh → logout)
- [ ] Testes de integração cobrindo: posts, favoritos e chat
- [ ] `app/services/` e `app/repositories/` populados para todos os domínios
- [ ] Diretório `data/` removido ou marcado como deprecated
- [ ] `arquitetura-back-end.md` atualizado para refletir o estado da Fase 2
