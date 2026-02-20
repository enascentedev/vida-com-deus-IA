# Vida com Deus – V2 (Resumo Estruturado e Otimizado)

> ⚠️ **Atenção permanente (Supabase Free): ~500 MB de banco.**  
> Estratégia base: **Postgres só para dados curados e metadados** + **Storage para bruto/arquivos/exports** + **monitoramento + arquivamento (ETL de escape)**.

---

## 1) Objetivo do MVP

Construir uma V2 do projeto **Vida com Deus** com:
- **Ingestão diária** (scraping) de conteúdo do *WGospel – Tempo de Refletir*
- **Persistência otimizada** (não estourar 500 MB)
- **IA** para enriquecimento (resumo/tags/devocional) e **Chat bíblico via RAG (simples com citações)**
- Deploy rápido com **Cron + Worker** (Airflow fica como evolução futura)

Fonte (scraping):  
- https://www.wgospel.com/tempoderefletir/

---

## 2) Stack de Tecnologias

### Front-end
- **React + Vite**
- **Tailwind CSS**
- **shadcn/ui** (componentes consistentes)
- **Axios** (HTTP client + interceptors)
- **TanStack Query** (cache/sync de dados de API – *server state*)
- **Zustand** (estado local/UX – *client state*)
- **React Router** (rotas)

### Back-end (API)
- **FastAPI**
- **Pydantic v2**
- **SQLAlchemy 2.0**
- **Alembic** (evolução do schema dentro da V2)
- Validação de token (Bearer) do Supabase no backend

### Autenticação
- **Supabase Auth** (mais simples e seguro):
  - cadastro/login, recuperação de senha, sessões e tokens (JWT)
  - integração direta com RLS (políticas por linha) no Postgres

### Banco e armazenamento
- **Supabase Postgres** (dados curados + metadados + métricas)
- **pgvector** (fase do chat bíblico/RAG e embeddings)
- **Supabase Storage** (HTML bruto, anexos e exports de arquivamento)

### ETL / Jobs (MVP)
- **Cron + Worker** (mais rápido que Airflow para começar)
  - Cron dispara rotinas (diária e/ou por horário)
  - Worker executa scraping/enriquecimento/monitoramento

### Infra
- **Docker (dev/local)** (opcional)
- **Render (produção)**:
  - Static Site (front)
  - Web Service (API FastAPI)
  - Background Worker (jobs)
  - Cron Jobs (agendamento diário/horário)

---

## 3) Funcionalidades (MVP)

### A) Autenticação e conta (Supabase Auth)
- cadastro/login/logout
- recuperação de senha
- sessão e tokens (JWT)

### B) Conteúdo (núcleo do app)
- listar conteúdo diário (post do dia)
- visualizar detalhes
- (opcional MVP) favoritos / histórico

### C) ETL diário (scraping + normalização)
- pegar o post mais recente do dia
- salvar HTML bruto no Storage
- extrair metadados (data, título, referência bíblica, trecho, texto)
- persistir dados curados no Postgres

### D) Enriquecimento com IA (fase MVP, simples)
- gerar **resumo**
- gerar **tags**
- gerar **devocional** (texto curto e aplicado)

### E) Chat bíblico (RAG simples com citações)
- pergunta do usuário → busca top-k trechos → resposta com **referências bíblicas**
- apenas **pt-BR** (MVP)

### F) Monitoramento e alertas (essencial por causa dos 500 MB)
- medir tamanho do banco
- alertar em **70% / 85% / 95%**
- registrar histórico de métricas
- (fase 2) acionar automaticamente arquivamento/limpeza quando crítico

---

## 4) Resumo da Arquitetura

```
[React + Vite + shadcn/ui]
          |
          v
       [FastAPI]  <--- valida JWT do Supabase Auth
          |
          +--> [Supabase Postgres] (curated + metrics + ai_enrichments)
          |
          +--> [Supabase Storage] (HTML bruto + exports/arquivos)  <-- protege o limite de 500MB
          |
          +--> [Worker Jobs]
                 - Scraping diário (WGospel)
                 - Enriquecimento IA
                 - Monitor DB (70/85/95)
                 - (futuro) Arquivamento ETL
          |
          +--> [Cron Jobs] (Render)
                 - agenda scraping diário
                 - agenda monitoramento periódico
```

---

## 5) Estrutura do Repositório (Monorepo)

```
vida-com-deus-v2/
  apps/
    web/                 # React + Vite
    api/                 # FastAPI
    worker/              # ETLs + monitor + scraping
  packages/
    shared/              # utils/tipos (opcional)
  infra/
    docker-compose.yml   # dev/local (opcional)
  docs/
    architecture.md
```

---

## 6) Modelo de Dados (Postgres – Supabase)

### Tabelas principais
- **sources**: catálogo de fontes (ex.: WGospel)
- **ingestion_runs**: auditoria de cada execução diária
- **raw_documents**: documento bruto (aponta para Storage) + hash
- **posts**: conteúdo curado (texto limpo + metadados)
- **ai_enrichments**: resumo/tags/devocional (por modelo/versão)
- **db_size_metrics**: histórico do tamanho do banco
- **db_alerts_sent**: controle anti-spam de alertas

### Convenção de camadas (boa prática)
- **raw/landing**: bruto no Storage
- **staging**: parse/normalização (no Postgres, leve)
- **curated**: conteúdo final para o app (no Postgres)
- **enriched**: IA (no Postgres; com retenção/versionamento)

---

## 7) ETL Diário – Fluxo (WGospel)

### Pipeline (idempotente)
1. Criar `ingestion_run` do dia (status = running)
2. Baixar listagem `/tempoderefletir/` e obter link do post do dia
3. Baixar HTML do post
4. Gerar `content_hash` (dedupe)
5. Upload do HTML bruto no **Supabase Storage**  
   Ex.: `raw/wgospel/tempoderefletir/YYYY-MM-DD/<hash>.html`
6. Inserir/atualizar `raw_documents` (com `storage_path`)
7. Parse do HTML:
   - `published_date`
   - `title`
   - `scripture_reference` + `scripture_excerpt`
   - `content_text` (limpo)
   - `audio_url` (se existir)
8. Upsert em `posts` (chave: `source_id + published_date`)
9. Enriquecimento IA (resumo/tags/devocional) → `ai_enrichments`
10. Finalizar `ingestion_run` (success/failed)

---

## 8) Conteúdo Bruto fora do Postgres (explicação rápida)

**Por quê?**  
HTML bruto e históricos crescem rápido e podem **estourar 500 MB**.

**Como fica:**
- Postgres guarda **só o essencial** para listar/buscar/relacionar
- Storage guarda o “peso”:
  - HTML bruto do scraping
  - exports (Parquet/JSONL) de arquivamento
  - anexos/arquivos

**O Postgres referencia o Storage** via colunas como:
- `storage_bucket`
- `storage_path`
- `content_hash`

---

## 9) Monitoramento do Banco + Alertas (70/85/95)

### Objetivo
Evitar chegar no limite de ~500 MB e entrar em modo read-only.

### Regras de alerta
- **70%**: aviso (planejar retenção/ajustes)
- **85%**: alerta (ativar arquivamento/limpeza)
- **95%**: crítico (rodar ETL de escape; reduzir dados imediatamente)

### Métricas persistidas
- tabela `db_size_metrics` (histórico + nível)
- tabela `db_alerts_sent` (anti-spam)

---

## 10) “ETL de Escape” (arquivamento) – sugestão

Quando bater 85–95%:
- Exportar dados antigos/pesados (ex.: `raw_documents` antigos, logs, versões antigas) para **Storage** em **JSONL/Parquet**
- Manter no Postgres apenas:
  - manifest do batch (`archive_batches` futuro)
  - índices mínimos (id, hash, datas, storage_path)
- Apagar do Postgres o que já foi arquivado (com validação)

Isso mantém o Postgres “magro” e sustentável no Free.

---

## 11) Deploy (Render) – MVP

- **Static Site**: `apps/web` (build Vite)
- **Web Service**: `apps/api` (FastAPI/uvicorn)
- **Background Worker**: `apps/worker`
- **Cron Jobs**:
  - `monitor_db_size` (ex.: a cada 6h)
  - `daily_ingest_wgospel` (1x por dia)
  - (opcional) `enrich_ai` (após ingest, ou acoplado)

---

## 12) Próximos Passos (ordem recomendada)

1. Criar tabelas no Supabase (DDL)
2. Front: Supabase Auth (login) + rotas base
3. API: endpoints de posts + validação Bearer token
4. Worker: scraping diário + upload no Storage + upsert
5. Worker: monitoramento DB + alertas 70/85/95
6. IA: resumo/tags/devocional (e versionamento de prompt)
7. Chat bíblico: RAG simples com citações (pt-BR)
8. Evolução: “modo estudo” + múltiplas fontes + Airflow (novo projeto/fase)

---

## 13) Notas de boas práticas (rápidas)
- **Nunca** expor `SERVICE_ROLE_KEY` no front (somente worker/backend)
- Aplicar **RLS** se o acesso ao DB for direto via client
- Content hashing e idempotência no ETL para evitar duplicações
- Logs e métricas: guardar leve (e com retenção) para não gastar os 500 MB

