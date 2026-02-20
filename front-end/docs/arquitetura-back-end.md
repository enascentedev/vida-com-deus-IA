# Arquitetura Back-end

## 1. Objetivo do Documento

Este documento consolida a arquitetura recomendada para o back-end da aplicacao **Vida com Deus**, com foco em:

- Escalabilidade futura (alto volume de acessos)
- Evolucao segura por etapas
- Validacao funcional antes da modelagem final de banco
- Reducao de risco tecnico e de retrabalho

A proposta foi derivada da analise das telas e fluxos atuais do front-end e das decisoes discutidas neste chat.

## 2. Contexto Atual do Projeto

Estado atual identificado no front-end:

- Front-end React com 10 rotas principais (`src/App.tsx`)
- Interfaces completas de produto (auth, feed, post detail, chat IA, biblioteca, configuracoes, admin)
- Dados ainda mockados nas telas
- Sem camada de integracao HTTP implementada no front ate o momento

Implicacao arquitetural:

- O back-end pode ser definido por contratos claros desde o inicio
- Existe liberdade para desenhar API e dominio com qualidade
- E possivel validar comportamento via testes antes da persistencia final

## 3. Funcionalidades de Produto (extraidas do front)

### 3.1 Autenticacao e Conta

- Cadastro de usuario
- Login com email/senha
- Recuperacao e redefinicao de senha
- Encerramento de sessao (logout)
- Base para login social (Google/Apple) em fase futura

Referencias no front:

- `src/pages/Login.tsx`
- `src/components/auth/LoginForm.tsx`
- `src/pages/SignUp.tsx`
- `src/pages/PasswordRecovery.tsx`

### 3.2 Conteudo Devocional

- Feed com post do dia
- Listagem de posts recentes
- Busca de conteudo
- Detalhe de post por identificador
- Conteudo de apoio: resumo IA, tags, devocional
- Audio associado ao post

Referencias no front:

- `src/pages/Home.tsx`
- `src/pages/PostDetail.tsx`

### 3.3 Biblioteca (Favoritos e Historico)

- Adicionar/remover favoritos
- Exibir historico de acesso/interacao
- Busca textual
- Filtros por tag/tipo/periodo

Referencia no front:

- `src/pages/Favorites.tsx`

### 3.4 Chat Biblico com IA

- Conversas com mensagens do usuario e da IA
- Citacoes biblicas por resposta
- Sugestoes de perguntas
- Persistencia de historico por usuario
- Base para memoria IA opcional (RAG)

Referencia no front:

- `src/pages/BiblicalAIChat.tsx`

### 3.5 Configuracoes

- Perfil (nome, email, avatar)
- Preferencias de tema
- Toggles: insights IA, lembretes biblicos, memoria IA
- Status de acesso/plano (preparado para premium)

Referencia no front:

- `src/pages/AccountSettings.tsx`

### 3.6 Monitoramento Administrativo

- Indicadores de capacidade
- Historico de crescimento
- Execucoes ETL
- Alertas operacionais

Referencia no front:

- `src/pages/AdminDatabaseMonitor.tsx`

## 4. Principios de Arquitetura

### 4.1 Estrategia Macro

Adotar **Monolito Modular** como fase inicial, com capacidade de extracao de servicos quando houver necessidade real.

Motivos:

- Menor complexidade operacional inicial
- Entrega mais rapida de valor
- Menos custo de coordenacao
- Facilita testes de ponta a ponta
- Mantem caminho claro para evolucao a arquitetura distribuida

### 4.2 Regras de Projeto

- Contratos HTTP first (OpenAPI) antes da implementacao completa
- Separacao por dominio de negocio, nao por tipo de arquivo apenas
- Baixo acoplamento entre modulos
- Idempotencia e rastreabilidade nas operacoes criticas
- Observabilidade desde o primeiro deploy

## 5. Ordem Recomendada de Execucao

A ordem recomendada para reduzir risco e evitar retrabalho:

1. Definir contratos de API e casos de uso
2. Criar mocks e testes de fluxo
3. Validar comportamento funcional com o front
4. Modelar banco definitivo baseado nos fluxos validados
5. Implementar persistencia e otimizacoes de escala
6. Executar carga, hardening e readiness de producao

Observacao importante:

- Banco de dados nao deve ser totalmente postergado, mas **fechado** apenas apos os fluxos e contratos estarem validados.

## 6. Arquitetura Logica Proposta

### 6.1 Modulos de Dominio

- `auth`
- `users`
- `posts`
- `library`
- `chat`
- `admin_monitoring`

### 6.2 Camadas Internas

Para cada modulo:

- `api` (rotas, schemas de request/response)
- `service` (casos de uso)
- `repository` (acesso a dados)
- `domain` (entidades e regras)

Camadas transversais:

- `core` (config, seguranca, logger, tracing)
- `workers` (tarefas assincronas)
- `integrations` (provedores externos: email, IA, storage)

## 7. Estrutura de Pastas Sugerida (FastAPI)

```text
backend/
  app/
    main.py
    core/
      config.py
      security.py
      observability.py
      dependencies.py
    api/
      router.py
      v1/
        auth.py
        users.py
        posts.py
        library.py
        chat.py
        admin.py
    domain/
      auth/
      users/
      posts/
      library/
      chat/
      admin/
    services/
      auth_service.py
      user_service.py
      post_service.py
      library_service.py
      chat_service.py
      admin_service.py
    repositories/
      base.py
      user_repo.py
      post_repo.py
      library_repo.py
      chat_repo.py
      admin_repo.py
    workers/
      tasks.py
      etl.py
      notifications.py
    integrations/
      ai_provider.py
      email_provider.py
      storage_provider.py
  tests/
    unit/
    integration/
    contract/
    e2e/
    load/
  pyproject.toml
  uv.lock
```

## 8. Contratos de API (MVP)

### 8.1 Auth

- `POST /v1/auth/signup`
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`
- `POST /v1/auth/forgot-password`
- `POST /v1/auth/reset-password`
- `POST /v1/auth/logout`

### 8.2 Usuario e Configuracoes

- `GET /v1/users/me`
- `PATCH /v1/users/me`
- `GET /v1/users/me/settings`
- `PATCH /v1/users/me/settings`

### 8.3 Posts e Feed

- `GET /v1/posts/feed`
- `GET /v1/posts`
- `GET /v1/posts/{post_id}`
- `GET /v1/posts/{post_id}/audio`

### 8.4 Biblioteca

- `GET /v1/library?tab=favorites|history&query=&tag=&period=`
- `POST /v1/library/favorites/{post_id}`
- `DELETE /v1/library/favorites/{post_id}`
- `POST /v1/library/history/{post_id}`

### 8.5 Chat IA

- `POST /v1/chat/conversations`
- `GET /v1/chat/conversations`
- `GET /v1/chat/conversations/{conversation_id}/messages`
- `POST /v1/chat/conversations/{conversation_id}/messages`

### 8.6 Admin

- `GET /v1/admin/metrics/storage`
- `GET /v1/admin/metrics/growth`
- `GET /v1/admin/etl/runs`
- `POST /v1/admin/etl/runs/execute`
- `GET /v1/admin/alerts`

## 9. Modelo de Dados (conceitual inicial)

Entidades candidatas:

- `users`
- `user_sessions` / `refresh_tokens`
- `password_reset_tokens`
- `posts`
- `post_tags`
- `post_audio`
- `favorites`
- `history_items`
- `chat_conversations`
- `chat_messages`
- `chat_citations`
- `user_settings`
- `etl_runs`
- `system_alerts`
- `storage_metrics`

Diretrizes para a modelagem:

- Definir chaves e indices a partir dos endpoints e queries reais
- Evitar otimizar sem metrica
- Incluir auditoria minima (`created_at`, `updated_at`, `created_by` quando aplicavel)
- Planejar soft-delete onde houver valor de historico

## 10. Estrategia de Escalabilidade

### 10.1 Escalabilidade de Aplicacao

- API stateless
- Multiplicas replicas horizontais
- Balanceamento por L7
- Uso de cache para leituras frequentes
- Rate limiting por IP e por usuario

### 10.2 Escalabilidade de Dados

- PostgreSQL como banco principal
- Redis para cache, locks e workloads transitivos
- Evolucao para `pgvector` quando memoria semantica/RAG for ativada
- Read replicas quando leitura superar escrita de forma consistente

### 10.3 Escalabilidade de Tarefas

- Filas assincronas para:
  - ETL
  - Envio de email
  - Processamento de embeddings/resumos
- Workers separados do processo HTTP

## 11. Seguranca

- JWT de acesso curto + refresh token rotativo
- Hash de senha com algoritmo forte (Argon2 ou bcrypt com parametros adequados)
- Protecao contra brute force em auth
- Validacao de input com Pydantic
- Sanitizacao de logs sensiveis
- CORS estrito por ambiente
- Segregacao de rotas admin por role/perfil

## 12. Observabilidade e Operacao

### 12.1 Logs

- Logs estruturados em JSON
- Correlation/request ID por requisicao
- Nivelamento por ambiente

### 12.2 Metricas

- Latencia por endpoint (p50, p95, p99)
- Taxa de erro por endpoint
- Throughput (RPS)
- Uso de CPU/memoria
- Tempo de fila e execucao de jobs

### 12.3 Tracing

- Tracing distribuido para fluxos criticos:
  - login
  - feed
  - envio de mensagem no chat
  - execucao ETL

## 13. Estrategia de Testes

### 13.1 Tipos de teste

- Unitarios (regras de negocio)
- Integracao (API + banco + cache)
- Contrato (OpenAPI / schema)
- E2E (fluxos do usuario)
- Carga (cenarios de pico)

### 13.2 Fluxos minimos obrigatorios

- Cadastro -> login -> acesso a feed
- Recuperacao de senha
- Leitura de post detalhado
- Adicao e remocao de favorito
- Envio de mensagem no chat e retorno com citacoes
- Consulta de painel admin com autenticacao de perfil admin

### 13.3 Metas iniciais de performance (sugeridas)

- p95 endpoints de leitura: < 300ms (sem IA)
- p95 auth: < 400ms
- Erro HTTP 5xx: < 1%
- Disponibilidade alvo inicial: >= 99.5%

## 14. Roadmap de Implementacao

### Fase 1 - Fundacao

- Setup FastAPI com `uv`
- Configuracao de ambientes
- Router versionado `/v1`
- Contratos OpenAPI do MVP
- Mocks para permitir integracao imediata com front

### Fase 2 - Core funcional

- Modulos `auth`, `users`, `posts`, `library`
- Persistencia inicial em PostgreSQL
- Cache de feed e posts
- Testes de integracao e contrato

### Fase 3 - IA e processamento assincrono

- Modulo `chat`
- Integracao com provedor de IA
- Filas/workers para tarefas longas
- Estrutura inicial de citacoes e memoria opcional

### Fase 4 - Operacao e escala

- Modulo `admin_monitoring`
- Dashboards de observabilidade
- Testes de carga e tuning
- Hardening de seguranca

## 15. Dependencias Sugeridas (Python/FastAPI com uv)

Base:

- `fastapi`
- `uvicorn[standard]`
- `pydantic`
- `pydantic-settings`
- `sqlalchemy` (ou `sqlmodel`)
- `alembic`
- `psycopg[binary]`
- `redis`
- `httpx`

Auth/seguranca:

- `python-jose[cryptography]` ou `pyjwt`
- `passlib[bcrypt]` (ou alternativa com Argon2)

Fila/assinc:

- `arq` ou `celery` (escolher 1)

Observabilidade:

- `structlog` (opcional)
- `prometheus-client`
- `opentelemetry-sdk` + instrumentacoes relevantes

Testes:

- `pytest`
- `pytest-asyncio`
- `pytest-cov`
- `respx` (se mock de HTTP externo for necessario)

## 16. Riscos e Mitigacoes

Risco: acoplamento prematuro a um unico provedor de IA.

- Mitigacao: camada `integrations/ai_provider.py` com interface abstrata.

Risco: crescer para microservicos cedo demais.

- Mitigacao: monolito modular ate gargalo real confirmado por metrica.

Risco: modelagem de banco baseada em suposicao.

- Mitigacao: fechar schema apenas apos validacao dos fluxos com testes.

Risco: chat gerar custo alto em picos.

- Mitigacao: rate limit, controle de contexto, cache de respostas e filas.

## 17. Definicao de Pronto por Etapa

Para cada etapa ser considerada concluida:

- Contratos OpenAPI atualizados
- Testes da etapa passando em CI
- Logs e metricas minimas operacionais ativas
- Checklist de seguranca da etapa validado
- Documento arquitetural atualizado

## 18. Decisao Arquitetural Final (neste momento)

A recomendacao consolidada para este projeto e:

- Iniciar com **FastAPI em monolito modular**
- Desenvolver **API orientada a contratos**
- Validar fluxos com **testes antes da modelagem final de banco**
- Evoluir para componentes distribuidos apenas quando houver evidencia operacional

Essa estrategia preserva velocidade de entrega, qualidade tecnica e caminho realista para escala.
