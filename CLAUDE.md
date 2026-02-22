# CLAUDE.md

Este arquivo orienta o Claude Code (claude.ai/code) ao trabalhar com o código deste repositório.

## Visão Geral

**Vida com Deus** — aplicação web devocional com feed de conteúdo bíblico, chat com IA e biblioteca pessoal. Monorepo com front-end React 19 e back-end FastAPI.

## Estrutura do Monorepo

```text
/
├── front-end/          # Aplicação React 19 + Vite + Tailwind v4
│   └── vida-com-deus-ui/  # Biblioteca local de componentes UI
└── back-end/           # API FastAPI (Python 3.13)
```

---

## Front-End

### Comandos

```bash
# Executar a partir de front-end/
npm run dev        # Servidor de desenvolvimento (localhost:5173)
npm run build      # Checagem TypeScript + bundle Vite
npm run lint       # ESLint
npm run preview    # Visualizar build de produção

# Biblioteca UI (executar a partir de front-end/vida-com-deus-ui/)
npm run build      # Gera dist/ (ESM + CJS + .d.ts)
npm run dev        # Modo watch
```

Ao alterar componentes em `vida-com-deus-ui`, rebuilde a biblioteca antes de testar no app principal.

### Arquitetura

**Dois pacotes locais:**

- **`front-end/`** — App principal. Consome `vida-com-deus-ui` via `"file:./vida-com-deus-ui"`.
- **`front-end/vida-com-deus-ui/`** — Biblioteca de componentes base (shadcn/ui + Radix). Construída com tsup. Não publicada no npm.

**Regra crítica:** Componentes base UI vivem **exclusivamente** em `vida-com-deus-ui`. Nunca criar `src/components/ui/`. Sempre importar de `"vida-com-deus-ui"`.

**Alias de caminho:** `@/*` → `src/*` (configurado em `tsconfig.app.json` e `vite.config.ts`).

**Tailwind CSS v4:** usa plugin `@tailwindcss/postcss` (não o legado `tailwindcss`). Variáveis CSS definidas em `src/index.css`.

### Rotas (React Router v7 — `src/App.tsx`)

| Rota | Página |
| ---- | ------ |
| `/` | Home (feed) |
| `/landing` | LandingPage |
| `/login` | Login |
| `/cadastro` | SignUp |
| `/recuperar-senha` | PasswordRecovery |
| `/post/:id` | PostDetail |
| `/chat` | BiblicalAIChat |
| `/biblioteca` | Favorites |
| `/configuracoes` | AccountSettings |
| `/gestao` | TherapistDashboard (layout + Outlet) |
| `/gestao/pacientes` | PatientListView |
| `/gestao/pacientes/:id` | PatientDetail |
| `/gestao/intake` | PatientIntakeForm |
| `/admin` | AdminDatabaseMonitor |

### Layout Compartilhado

- `src/components/layout/BottomNavigation.tsx` — nav inferior (Home, Chat, Biblioteca, Gestão, Admin)
- `src/components/layout/SecondaryTopbar.tsx` — topbar com botão voltar (páginas internas)

### Padrões Visuais

- Background de página: `bg-slate-50`
- Cards: `rounded-2xl border border-slate-100 bg-white shadow-sm`
- Cor primária: `blue-600`
- Bottom nav: `sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-slate-200`
- Topbar interna: `sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200`
- Padding lateral: `px-4`
- Ícones: `lucide-react` (não há Material Symbols)

### Convenções de Componentes

- Componentes funcionais com `React.forwardRef`
- Props estendem atributos nativos HTML (ex.: `ButtonHTMLAttributes`)
- Padrão `asChild` via Radix `Slot`
- Variantes com `class-variance-authority` (CVA); composição de classes com `cn()` (clsx + tailwind-merge)

---

## Back-End

### Dev e Testes

```bash
# Executar a partir de back-end/
uv sync                                    # Instalar dependências (cria .venv)
uv run alembic upgrade head                # Aplicar migrações (requer PostgreSQL configurado)
uv run uvicorn app.main:app --reload       # Servidor de desenvolvimento (localhost:8000)
pytest                                     # Todos os testes (50+)
pytest tests/contract                      # Testes de contrato
pytest --cov                               # Com cobertura
```

Copiar `.env.example` para `.env` e configurar as variáveis antes de rodar. `uv run` ativa o `.venv` automaticamente — não é necessário ativar manualmente. `DATABASE_URL` é obrigatória para os endpoints que usam banco real.

Documentação interativa disponível em `http://localhost:8000/docs` (Swagger UI).

### Camadas

**Estado atual (Fase 2):** Modelos SQLAlchemy 2.0 async, repositórios e serviços implementados.
Migrações Alembic para PostgreSQL com 4 versões cobrindo todos os domínios (incluindo `storage_snapshots`).
Chat bíblico integrado ao GPT-4o-mini (fallback mock quando `OPENAI_API_KEY` ausente).
Métricas de storage e alertas do admin agora leem dados reais do PostgreSQL via `pg_database_size()`.
Arquivos JSON locais (`data/`) mantidos como fallback de leitura durante transição.
Redis planejado para Fase 3.

```text
app/
├── api/v1/          # Routers FastAPI (auth, users, posts, library, chat, admin, therapist)
├── core/            # config.py (Pydantic Settings), security.py (JWT + Argon2),
│                    # dependencies.py, storage.py (JSON), scraper.py (ETL), database.py (SQLAlchemy)
├── domain/          # Schemas Pydantic por domínio (request/response da API)
├── models/          # Modelos SQLAlchemy 2.0 (User, Post, Favorite, Conversation, etc.)
├── repositories/    # Acesso a dados async (user, post, library, chat)
└── services/        # Lógica de negócio (auth, user, post, library, chat)
migrations/          # Alembic — 4 migrações versionadas (inclui storage_snapshots)
data/                # Persistência JSON local (fallback Fase 1.5)
├── posts.json       # Posts coletados pelo ETL
├── patients.json    # Pacientes do dashboard do psicólogo
├── favorites.json   # Favoritos da biblioteca por usuário
├── users.json       # Perfil do usuário autenticado
└── etl_runs.json    # Histórico das execuções de ETL (últimas 20)
```

**Roteamento:** `app/api/router.py` agrega todos os domínios sob o prefixo `/v1`. Ponto de entrada: `app/main.py`.

**Autenticação:** JWT com par access/refresh token. Lógica em `app/core/security.py`. Access token: 15 min; refresh token: 7 dias.

**CORS:** configurado para `localhost:5173` e `localhost:3000`.

### Endpoints Principais

| Domínio | Prefixo |
| ------- | ------- |
| Auth | `POST /v1/auth/{signup,login,refresh,logout,forgot-password,reset-password}` |
| Usuário | `GET/PATCH /v1/users/me`, `GET/PATCH /v1/users/me/settings` |
| Posts | `GET /v1/posts/feed`, `GET /v1/posts/{id}`, `GET /v1/posts/{id}/audio` |
| Biblioteca | `GET /v1/library/`, `POST/DELETE /v1/library/favorites/{id}` |
| Chat | `POST/GET /v1/chat/conversations`, `POST/GET /v1/chat/conversations/{id}/messages` |
| Therapist | `GET /v1/therapist/overview`, `GET/POST /v1/therapist/patients`, `GET/PATCH /v1/therapist/patients/{id}`, `PATCH .../status`, `PATCH .../limit`, `GET/POST .../sessions`, `PATCH .../sessions/{sid}` |
| Admin | `GET /v1/admin/metrics/storage`, `GET /v1/admin/metrics/growth`, `GET /v1/admin/metrics/tables`, `GET /v1/admin/alerts`, `GET /v1/admin/etl/runs`, `POST /v1/admin/etl/runs/execute` |
| Health | `GET /health` |

---

## Documentação do Projeto

- `back-end/arquitetura-back-end.md` — decisões arquiteturais, contratos de API, estratégia de testes
- `back-end/docs/decisoes-fase2.md` — decisões arquiteturais da Fase 2 (PostgreSQL, Argon2, Alembic)
- `front-end/docs/etapas.md` — histórico de trabalho concluído
- `front-end/docs/registro-features.md` — template obrigatório para registrar novas features

Novas features no front-end devem ser registradas em `docs/registro-features.md`.

## Idioma

Toda documentação, comentários no código e mensagens de commit em **Português (Brasil)**.
