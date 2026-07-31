# Plano — Autenticação e persistência reais (TASK-03)

Data: 30/07/2026
Branch de trabalho: `fix/auth-persistence`, criada a partir de `feat/integracao-banco`.

## 1. Diagnóstico

### Ponto de partida

O `main` estava na Fase 1.5: persistência em JSON (`back-end/data/*.json`), autenticação simulada com `MOCK_USER_ID = "user-mock-001"`, `MOCK_CONVERSATION`/`MOCK_MESSAGES` no chat e `get_current_user_id` que devolvia o usuário mock diante de token inválido ou ausente.

A branch `feat/integracao-banco` (nunca mergeada) já havia migrado o back-end para PostgreSQL + SQLAlchemy 2 async + Alembic, com repositórios, serviços, hash Argon2 e rotação básica de refresh token. Partir dela evitou reimplementar trabalho funcional. Custo aceito: ela está 4 commits atrás do `main` (commits de README/docs) e o merge fica a cargo da pessoa, fora desta tarefa.

### Lacunas encontradas na branch base

| # | Lacuna | Gravidade |
|---|---|---|
| 1 | Nenhum teste real de autenticação/persistência — os testes de contrato mockavam banco e serviços | alta |
| 2 | `decode_token` não validava o claim `type`: refresh token era aceito em rota protegida | alta |
| 3 | Logout do front não enviava o refresh token — nenhuma sessão era revogada de fato | alta |
| 4 | Reuso de refresh token revogado não derrubava a cadeia de rotação | alta |
| 5 | Segredo JWT com default fraco embutido no código e no `.env.example` | alta |
| 6 | Senha sem tamanho mínimo; email sem normalização | média |
| 7 | Login revelava existência de conta por diferença de tempo de resposta | média |
| 8 | Sem CI, sem lint, sem format-check, sem type-check | média |
| 9 | Chat com fallback mock silencioso quando `OPENAI_API_KEY` ausente | média |
| 10 | `except Exception` na autenticação convertia erro de banco em 401 | média |

## 2. Arquitetura adotada

A menor arquitetura coerente com o que a branch já tinha — nenhuma camada nova foi inventada:

```
app/
├── api/v1/          # Routers finos: validam entrada e delegam ao serviço
├── core/            # config (validada na inicialização), security (JWT tipado),
│                    # dependencies (autenticação), database (sessão async)
├── domain/          # Schemas Pydantic por domínio (contratos da API)
├── models/          # SQLAlchemy: User, RefreshToken (com session_id), PasswordResetToken,
│                    # UserSettings, ChatConversation, ChatMessage, ChatCitation
├── repositories/    # Acesso a dados (UserRepository, ChatRepository, ...)
├── services/        # Regras de negócio (auth_service, chat_service, ...)
└── integrations/    # openai_client: protocolo BiblicalAssistant + impl. real e stub
migrations/          # Alembic — 6 revisões criam o banco do zero
```

### Modelo de sessão

Cada login abre uma **sessão** (`session_id` UUID). O refresh token é um JWT com claims `sub`, `sid`, `type`, `jti`, `iat`, `exp`; no banco fica apenas o **SHA-256** do token, com `expires_at`, `is_revoked` e `revoked_at`. A rotação grava um novo hash com o mesmo `session_id` e revoga o anterior. **Reapresentar um hash revogado derruba a sessão inteira** (detecção de reuso). Logout revoga a sessão; `logout-all` revoga todas as sessões do usuário; reset de senha também.

### Decisões registradas

- **Tipo de token obrigatório.** `decode_token(token, expected_type=...)` recusa token sem `type`, com `type` errado, expirado, com assinatura inválida ou sem `sub`. A lista de algoritmos aceitos é fechada na configuração (apenas HS256/HS384/HS512).
- **Configuração falha cedo.** `JWT_SECRET_KEY` e `DATABASE_URL` não têm default. Segredo curto (<32) ou com valor de placeholder é recusado na inicialização. `python -m app.core.config_check` é o passo de validação do CI.
- **Resposta genérica no login.** Usuário inexistente, senha errada e conta desativada retornam o mesmo 401 "Credenciais inválidas"; quando o usuário não existe, `dummy_verify()` iguala o custo de tempo.
- **Sem mock silencioso no chat.** O stub da OpenAI existe (`StubBiblicalAssistant`), mas se declara no próprio texto da resposta e só é usado fora de produção; em produção sem chave, o endpoint responde 503.
- **mypy estrito por escopo.** `disallow_untyped_defs` vale para `app.core.*`, `app.services.auth_service`, `app.repositories.user_repository`, `app.domain.auth.*` e `app.integrations.*` — os módulos desta tarefa. Os demais domínios (posts, library, admin, therapist) são checados em modo padrão. Regra B008 do Ruff é ignorada por ser falso positivo com o `Depends` do FastAPI.
- **Guard de honestidade nos testes.** Testes de banco (`@pytest.mark.db`) são pulados com motivo explícito quando `TEST_DATABASE_URL` não existe; com `REQUIRE_DB=1` (CI) o pulo vira falha estrita. A suíte nunca "passa" sem ter tocado o banco no CI.

## 3. Migrations

Cadeia (aplicável em banco vazio, na ordem):

1. `df122fb2dd78` — users, refresh_tokens, password_reset_tokens, user_settings
2. `d98403ced0d7` — posts e tags
3. `dc263afe3007` — biblioteca, chat (conversations, messages, citations)
4. `a1b2c3d4e5f6` — storage_snapshots
5. `c3d4e5f6a7b8` — normalização de datas de posts
6. `e5a7c1b93f20` — **nova**: `session_id` e `revoked_at` em refresh_tokens, índices `refresh_tokens(user_id)`, `refresh_tokens(session_id)` e `chat_messages(conversation_id, created_at)` (substitui o índice simples). Downgrade implementado.

## 4. Compatibilidade com o front-end

Contratos preservados: signup/login/refresh/logout retornam os mesmos schemas (`TokenPair`, `MessageResponse`); users/chat inalterados. Duas mudanças aditivas:

- `POST /v1/auth/logout` agora aceita body opcional `{refresh_token}` — o front foi atualizado para enviá-lo (sem ele o servidor tenta revogar pela sessão do access token do header).
- `POST /v1/auth/logout-all` é endpoint novo.

## 5. O que ficou de fora (escopo)

- **Envio de email** na recuperação de senha: o token é criado e persistido, mas não há canal de entrega. Recuperação de senha está **Parcial** — documentado no README.
- **Extração de citações** das respostas reais da OpenAI: retorna lista vazia (estado declarado no código).
- **RAG**: explicitamente fora da tarefa.
- Merge de `fix/auth-persistence` com `main`: decisão da pessoa, após revisão.

## 6. Estado por categoria

| Funcionalidade | Estado |
|---|---|
| Cadastro/login com banco e Argon2 | Implementado |
| Access/refresh token tipados, rotação, revogação, detecção de reuso | Implementado |
| Conversas e mensagens persistidas com isolamento por usuário | Implementado |
| Perfil e configurações de usuário no banco | Implementado |
| Recuperação de senha | Parcial (sem envio de email) |
| Chat com IA | Implementado (real com chave; stub declarado em dev; 503 em produção sem chave) |
| Citações bíblicas extraídas da resposta real | Planejado |
| Painel therapist | Simulado (JSON local — fora do escopo desta tarefa) |
