# Etapas executadas

## Etapa 1 — Bootstrap do projeto

- Criado projeto Vite com React + TypeScript.
- Instalado e configurado TailwindCSS (v3) com PostCSS e autoprefixer.
- Ajustado `tailwind.config.js` com paths, tema (tokens CSS) e plugin `tailwindcss-animate`.
- Configurado aliases `@/*` no `tsconfig.app.json` e `vite.config.ts`.
- Criada estrutura base de pastas conforme o guia (`src/components`, `src/hooks`, `src/pages`, etc.).
- Adicionado `components.json` para o shadcn/ui.

## Etapa 2 — Componente de Login (shadcn)

- Criado `LoginForm` com componentes `Button`, `Input`, `Card`, `Separator`.
- Implementada página `Login` centralizada e responsiva.
- Ajustes visuais alinhados ao mock (ícone, tipografia, espaçamentos, botões sociais).
- Tela conectada no `App`.

## Etapa 3 — Biblioteca npm (abstração)

- Criada biblioteca local `vida-com-deus-ui` dentro do workspace (pasta própria).
- Componentes e utilitários extraídos para a lib (`Button`, `Input`, `Card`, `Separator`, `cn`).
- Build configurado com `tsup` gerando `dist` (esm/cjs/dts).
- App passou a consumir apenas os componentes base via `vida-com-deus-ui` (dependência local `file:`).
- `LoginForm` ficou no app e compõe os componentes da lib.

## Ajustes posteriores

- Corrigido alias `@` no TypeScript e import do `LoginForm` para caminho relativo.
- Configurados `tsconfig.app.json` e `tsconfig.node.json` com `composite` e emissão de tipos para project references.
- Ajustado `InputProps` na lib para `type` em vez de interface vazia.

## Publicação

- A biblioteca **não foi publicada** no npm.
- Portanto, **não há conta** associada à publicação.

## Etapa 4 — Migracao Tailwind CSS v3 → v4

### App principal

- Atualizado `tailwindcss` de `^3.4.19` para `^4.1.18`.
- Adicionado `@tailwindcss/postcss` (`^4.1.18`) como novo plugin PostCSS.
- Removido `autoprefixer` (integrado ao Tailwind v4).
- `postcss.config.js`: trocado plugin `tailwindcss` + `autoprefixer` por `@tailwindcss/postcss`.
- `src/index.css`: substituidas diretivas `@tailwind base/components/utilities` por `@import "tailwindcss"`.
- `src/index.css`: adicionado bloco `@theme` com tokens de cores e border-radius (migrados do JS).
- `tailwind.config.js`: removidos `colors` e `borderRadius` do `extend` (agora definidos via CSS no `@theme`).

### Biblioteca `vida-com-deus-ui`

- Adicionado `tailwindcss: ^4.0.0` como `peerDependency`.
- Adicionado `tailwindcss: ^4.1.18` como `devDependency`.

## Etapa 5 — Documentacao e padronizacao

### Padrao de registro de features

- Criado `docs/registro-features.md` com template obrigatorio para registro de novas features.
- Adicionado primeiro registro: "Atualizacao do Tailwind para v4".
- Linkado em `docs/etapas.md`.

### README do projeto

- Reescrito `README.md` completo substituindo o template padrao do Vite.
- Inclui: visao geral, motivacao da v2, funcionalidades, tech stack, arquitetura, instrucoes de instalacao e aprendizados.

### Gitignore

- Adicionado `CLAUDE.md` ao `.gitignore` para evitar commit de instrucoes locais do Claude Code.

## Etapa 6 — Implementacao dos Layouts de Telas (Design System)

### Roteamento

- Instalado `react-router-dom` como dependencia de producao.
- `App.tsx` refatorado para usar `<BrowserRouter>` com `<Routes>/<Route>`.
- Definidas 10 rotas: `/landing`, `/login`, `/cadastro`, `/recuperar-senha`,
  `/` (Home), `/post/:id`, `/chat`, `/biblioteca`, `/configuracoes`, `/admin`.

### Componentes de Layout Compartilhados

- Criado `src/components/layout/BottomNavigation.tsx`:
  - Nav inferior com 4 abas: Inicio, Chat, Biblioteca, Admin.
  - Detecta aba ativa automaticamente via `useLocation`.
  - Usa `useNavigate` para transicao entre rotas.
- Criado `src/components/layout/SecondaryTopbar.tsx`:
  - Topbar com botao voltar (`ChevronLeft`) e titulo centralizado.
  - Aceita `rightSlot` opcional para acoes customizadas (ex.: icones de acao).
  - `onBack` customizavel; padrao e `navigate(-1)`.
- `Home.tsx` refatorado para importar `BottomNavigation` do modulo compartilhado.

### Paginas Implementadas

Todos os layouts foram implementados com base nos designs em `docs/designer/`
(arquivos `screen.png` e `code.html`):

- `LandingPage` (`/landing`) — pagina publica com header, hero com imagem,
  secao "Como funciona" (3 feature cards), CTA banner e footer com links.
- `SignUp` (`/cadastro`) — formulario de cadastro: nome, email, senha,
  confirmar senha, checkbox de termos, botao CTA, divisor e botoes sociais.
- `PasswordRecovery` (`/recuperar-senha`) — campo de email com icone inline,
  botao de envio, banner de sucesso com estado controlado e link de reenvio.
- `PostDetail` (`/post/:id`) — player de audio com barra de progresso estatica,
  versículo em card com borda lateral azul, tabs (Resumo/Tags/Devocional) com
  conteudo dinamico e FAB redondo para abrir o chat com IA.
- `BiblicalAIChat` (`/chat`) — header com status online, area de mensagens
  scrollavel, bolhas de usuario (direita, azul) e IA (esquerda, branca),
  citacoes biblicas em pills clicaveis, accordion "Trechos utilizados",
  estado de loading com dots animados, chips de sugestao e campo de input.
- `Favorites` (`/biblioteca`) — toggle Favoritos/Historico, barra de busca
  com filtro inline, chips de filtro horizontais com scroll, lista de items
  com icone, titulo, subtitulo e botao de exclusao, estado vazio e FAB `+`.
- `AccountSettings` (`/configuracoes`) — header de perfil com avatar e botao
  de edicao, secao Geral (informacoes pessoais, acesso premium), seletor de
  tema 3 opcoes (Light/Dark/System), toggles de IA e notificacoes e botao
  de logout vermelho.
- `AdminDatabaseMonitor` (`/admin`) — card de capacidade de armazenamento com
  barra de progresso com limiares de cor (warning/critical), grafico SVG de
  linha (historico 7 dias), tabela de execucoes ETL com status colorido e
  tabela de alertas do sistema.

### Atualizacoes em arquivos existentes

- `LoginForm`: adicionados `useNavigate` e navegacao para `/recuperar-senha`
  e `/cadastro`.
- `Home.tsx`: navegacao funcional para `/post/1` e `/chat`; refatoracao do
  `BottomNavigation` para componente compartilhado.

### Resultado

- `npm run build` limpo: 0 erros de TypeScript, bundle de 330kB.
- Todas as 10 rotas funcionais e navegaveis.

## Etapa 7 — Script de Capturas de Tela (Playwright)

### Objetivo

Criar um script automatizado para capturar screenshots de todas as rotas da aplicacao
em dois viewports (desktop e mobile iPhone 11), organizando as imagens por data e hora
da execucao.

### O que foi feito

- Instalado `playwright` (Python) e browser Chromium via `python -m playwright install chromium`.
- Criado `scripts/screenshot-routes.py` com as seguintes caracteristicas:
  - Captura todas as 10 rotas definidas em `App.tsx`.
  - Viewport **desktop**: 1280×800px, `full_page=True`.
  - Viewport **mobile iPhone 11**: 390×844px, DPR 2×, user-agent mobile e flags `is_mobile`/`has_touch`.
  - Diretorio de saida: `screenshots/{YYYY-MM-DD_HH-MM-SS}/desktop/` e `.../mobile-iphone11/`.
  - O timestamp e gerado no inicio da execucao, antes de qualquer captura.
- Execucao via helper `with_server.py` (skill webapp-testing) que gerencia o ciclo de vida do Vite:

  ```bash
  python with_server.py --server "npm run dev" --port 5173 -- python scripts/screenshot-routes.py
  ```

- Total de imagens por execucao: **20** (10 rotas × 2 viewports).

### Rotas capturadas

`/landing`, `/login`, `/cadastro`, `/recuperar-senha`, `/`, `/post/1`,
`/chat`, `/biblioteca`, `/configuracoes`, `/admin`.

---

## Etapa 8 — Reorganizacao em Monorepo (PR #2)

### Contexto — Etapa 8

- Branch: `feat/criacao-layout` → mergeado em `main` em 2026-02-20.

### Mudancas realizadas — Etapa 8

- Todos os arquivos do front-end (src/, docs/, scripts/, configs) foram movidos
  da raiz do repositório para o diretório `front-end/`.
- Criado `front-end/.gitignore` com padrões adequados para Vite + Tailwind + TypeScript.
- Raiz do repositório ficou limpa, contendo apenas `front-end/`, `back-end/` e
  arquivos globais (README, .gitignore raiz).

### Motivacao — Etapa 8

Separar front-end e back-end em diretórios dedicados para suportar estrutura
monorepo e facilitar CI/CD independente por camada.

### Commits do PR #2

- `056b2ab` — ♻️ refactor: reorganiza projeto em monorepo com diretório front-end/
- `0983e9f` — 🔥 refactor: remove arquivos da raiz movidos para front-end/ e adiciona .gitignore

---

## Etapa 9 — Estrutura Inicial do Back-End FastAPI (PR #3)

### Contexto — Etapa 9

- Branch: `feat/criacao-backend` → mergeado em `main` em 2026-02-20.

### Implementacao — Etapa 9

- Criado diretório `back-end/` com estrutura modular orientada a domínios:
  - `app/main.py` — ponto de entrada FastAPI com CORS e health check.
  - `app/api/router.py` — agrega todos os routers sob o prefixo `/v1`.
  - `app/api/v1/` — routers por domínio: auth, users, posts, library, chat, admin.
  - `app/core/` — config (Pydantic Settings), security (JWT), dependencies.
  - `app/domain/` — schemas Pydantic por domínio.
  - `tests/contract/` — 40+ testes de contrato cobrindo todos os endpoints.
- Criado `back-end/.gitignore` com padrões Python (venv, `__pycache__`, .env).
- Criado `back-end/README.md` com documentação completa da API.
- Criado `back-end/arquitetura-back-end.md` com decisões arquiteturais detalhadas.
- **Estado Fase 1:** todos os endpoints retornam dados mockados. Banco de dados
  (PostgreSQL) e cache (Redis) planejados para Fase 2.

### Tech Stack do back-end

- FastAPI 0.115, Python 3.13, Pydantic v2, python-jose (JWT), pytest, uv.

### Endpoints implementados

| Domínio   | Prefixo                                                                       |
| --------- | ----------------------------------------------------------------------------- |
| Auth      | `POST /v1/auth/{signup,login,refresh,logout,forgot-password,reset-password}`  |
| Usuário   | `GET/PATCH /v1/users/me`, `GET/PATCH /v1/users/me/settings`                  |
| Posts     | `GET /v1/posts/feed`, `GET /v1/posts/{id}`, `GET /v1/posts/{id}/audio`       |
| Biblioteca | `GET /v1/library/`, `POST/DELETE /v1/library/favorites/{id}`                |
| Chat      | `POST/GET /v1/chat/conversations`, `POST/GET /v1/chat/conversations/{id}/messages` |
| Admin     | `GET /v1/admin/metrics/storage`, `GET /v1/admin/alerts`, `POST /v1/admin/etl/runs/execute` |
| Health    | `GET /health`                                                                 |

### Commits do PR #3

- `b8ac93d` — ✨ feat: estrutura inicial do back-end (FastAPI + domínios)
- `1e9dfb7` — 🙈 chore: melhora .gitignore do back-end

---

## Etapa 10 — Integração Front-End com Back-End API

Conectar todas as páginas do app à API FastAPI (Fase 1, dados mock). A etapa introduz três
camadas novas no front-end e modifica 10 arquivos existentes.

**Camada de cliente API (`src/lib/api.ts`):**

- Fetch wrapper centralizado com injeção automática de token Bearer via `Authorization` header.
- Retry automático de 401: tenta `POST /v1/auth/refresh`; se falhar, dispara `CustomEvent("auth:logout")`.
- 20 tipos TypeScript que espelham os schemas Pydantic do back-end.
- Funções agrupadas por domínio: `authApi`, `usersApi`, `postsApi`, `libraryApi`, `adminApi`, `chatApi`.
- Chaves de localStorage prefixadas com `vida_deus_` para evitar colisão em desenvolvimento.

**Estado global (`src/store/useAuthStore.ts`):**

- Zustand store com: `isAuthenticated`, `user: UserProfile | null`.
- Actions: `initFromStorage`, `login`, `signup`, `logout`, `setUser`, `clearAuth`.
- `initFromStorage()` restaura sessão do localStorage na montagem — sem chamada extra à API.
- `login()`: `POST /v1/auth/login` → salva tokens → `GET /v1/users/me` → popula store.
- Escuta `CustomEvent("auth:logout")` para limpar sessão em falha de refresh.

**Rotas protegidas (`src/components/auth/ProtectedRoute.tsx`):**

- Componente usa `<Outlet />` do React Router v7.
- Redireciona para `/login` se `isAuthenticated === false`.
- `App.tsx` envolve 6 rotas autenticadas com `<ProtectedRoute>` e chama `initFromStorage()` na montagem.

**Páginas conectadas:**

- `LoginForm.tsx` — form controlado, `authStore.login()`, mensagem de erro inline.
- `SignUp.tsx` — validações client-side (senhas iguais, termos aceitos), `authStore.signup()`.
- `PasswordRecovery.tsx` — `authApi.forgotPassword()`.
- `Home.tsx` — `GET /v1/posts/feed`, Skeleton durante carregamento, avatar via auth store.
- `PostDetail.tsx` — `GET /v1/posts/:id` via `useParams`, toggle favorito otimista.
- `Favorites.tsx` — `GET /v1/library?tab=favorites|history`, delete otimista.
- `AccountSettings.tsx` — perfil do auth store, settings com auto-save, logout real.
- `AdminDatabaseMonitor.tsx` — 4 endpoints em `Promise.all`, botão ETL funcional, `timeAgo()`.
- `BiblicalAIChat.tsx` — migrado para `chatApi`, avatar via auth store.

**Dependência instalada:**

- `zustand ^5.0.5` (adicionado ao `package.json`).

**Variável de ambiente:**

- `VITE_API_BASE_URL=http://localhost:8000/v1` em `.env.example` (commitado) e `.env` (gitignored).

**Agente criado:**

- `front-end/.claude/agents/api-integration-specialist.md` — subagente Claude especializado
  com contrato completo da API, padrões obrigatórios e protocolo de implementação dos 14 passos.

---

## Etapa 11 — Dashboard do Psicólogo (2026-02-21)

**Objetivo:** Criar nova rota `/gestao` com Dashboard do Psicólogo completo (gestão de
pacientes, formulário de avaliação, sessões terapêuticas, diretrizes para IA, controle de
mensagens). A rota `/admin` permanece intacta com o monitor de infraestrutura.

**Back-end:**

- Novo domínio `therapist` com 11 schemas Pydantic em `app/domain/therapist/schemas.py`:
  `TherapySession`, `PatientConfig`, `PatientSummary`, `PatientIntakeForm`, `DashboardOverview`,
  `PatientListResponse`, `UpdatePatientConfigRequest`, `UpdatePatientStatusRequest`,
  `UpdateMessageLimitRequest`, `CreateSessionRequest`, `SessionListResponse`.
- 10 endpoints mock em `app/api/v1/therapist.py` com persistência em `data/patients.json`.
- Router registrado em `app/api/router.py`.
- 21 testes de contrato adicionados (happy path + validação 422).
- Fix: `config.py` adicionado `extra="ignore"` no `SettingsConfigDict` para aceitar variáveis
  extras no `.env`.

**Front-end — Tipos e API:**

- 13 interfaces TypeScript e tipos auxiliares (`MoodLevel`, `PatientStatus`, etc.) em `api.ts`.
- Novo objeto `therapistApi` com 10 métodos (separado do `adminApi`).

**Front-end — UI:**

- `TherapistDashboard.tsx` — layout wrapper com header, navegação por sub-rotas e `<Outlet />`.
- `OverviewView.tsx` — visão geral com cards de contadores, pacientes perto do limite e atividade.
- `PatientListView.tsx` — lista com filtro por status, barra de progresso de mensagens.
- `PatientIntakeForm.tsx` — formulário com 4 blocos (identificação, avaliação clínica,
  diretrizes IA, primeira sessão), pills, tags, slider, emojis de humor.
- `PatientDetail.tsx` — ficha com 5 seções (status, cota, diretrizes editáveis, sessões, clínica).
- `SessionForm.tsx` — modal para criar/editar sessão.
- `SessionCard.tsx` — card compacto na timeline de sessões.

**Rotas e Navegação:**

- Rotas aninhadas em `App.tsx`:
  - `/gestao` → `OverviewView` (index)
  - `/gestao/pacientes` → `PatientListView`
  - `/gestao/pacientes/:patientId` → `PatientDetail`
  - `/gestao/intake` → `PatientIntakeForm`
- `BottomNavigation` com 5 abas: Início, Chat, Biblioteca, **Gestão**, Admin.
- Detecção de aba ativa via `pathname.startsWith("/gestao")`.

**Arquivos criados (10):**

- `back-end/app/domain/therapist/__init__.py`
- `back-end/app/domain/therapist/schemas.py`
- `back-end/app/api/v1/therapist.py`
- `front-end/src/pages/TherapistDashboard.tsx`
- `front-end/src/components/therapist/OverviewView.tsx`
- `front-end/src/components/therapist/PatientListView.tsx`
- `front-end/src/components/therapist/PatientIntakeForm.tsx`
- `front-end/src/components/therapist/PatientDetail.tsx`
- `front-end/src/components/therapist/SessionForm.tsx`
- `front-end/src/components/therapist/SessionCard.tsx`

**Arquivos modificados (5):**

- `back-end/app/api/router.py` — `include_router(therapist.router)`
- `back-end/app/core/config.py` — `extra="ignore"` para variáveis extras no `.env`
- `back-end/tests/contract/test_endpoints.py` — 21 novos testes
- `front-end/src/lib/api.ts` — 13 interfaces + `therapistApi`
- `front-end/src/App.tsx` — rotas aninhadas `/gestao/*`
- `front-end/src/components/layout/BottomNavigation.tsx` — 5a aba "Gestão"

---

## Documentacao

1. [Registro de Features](./registro-features.md)

---

## Etapa 12 — Persistencia JSON, ETL Real e Integracao OpenAI (2026-02-21)

**Objetivo:** Substituir dados mock estaticos por persistencia real em arquivos JSON locais
(Fase 1.5), implementar ETL de scraping do site wgospel.com e conectar o chat a API OpenAI
(GPT-4o-mini) com fallback mock.

### Back-end

**Utilitario de armazenamento (`app/core/storage.py`):**

- Modulo centralizado de leitura e escrita de arquivos JSON em `data/`.
- Funcoes exportadas: `read_json`, `write_json`, `append_etl_run`, `get_etl_runs`.
- Diretorio `data/` criado automaticamente se nao existir.
- Historico de ETL limitado a 20 entradas (`etl_runs.json`).

**ETL de scraping (`app/core/scraper.py`):**

- Scraper do site `https://www.wgospel.com/tempoderefletir/` usando `httpx` e `BeautifulSoup4`.
- Coleta ate 20 posts por execucao da listagem e acessa cada post individualmente.
- Extrai: titulo, referencia biblica, excerpt, corpo do texto devocional, oracao, URL de audio e duracao.
- Deteccao de paragrafo de versiculos via regex (`_VERSE_REF_RE`).
- Filtragem de paragrafos promocionais via lista de marcadores (`_PROMO_MARKERS`).
- IDs de posts gerados via `uuid.uuid5(NAMESPACE_URL, href)` — deterministico por URL.
- Merge com `data/posts.json` existente — evita duplicatas, preserva posts antigos.
- Retorna dict com status, contadores e mensagem para registro no historico ETL.

**Endpoints atualizados:**

- `admin.py` — `POST /v1/admin/etl/runs/execute` agora executa o scraper real, mede duracao
  e persiste resultado em `etl_runs.json`. `GET /v1/admin/etl/runs` le do JSON real.
  Mock estatico `MOCK_ETL_RUNS` removido.
- `posts.py` — `GET /v1/posts/feed` e `GET /v1/posts/{id}` carregam dados de `data/posts.json`
  quando disponivel; fallback para mock se o arquivo nao existir.
  Schema `PostDetail` ganhou campos `source_url` e `body_text`.
- `library.py` — favoritos persistidos em `data/favorites.json`. Mock estatico `MOCK_FAVORITES`
  removido. `POST /add`, `DELETE /remove` gravam no JSON.
- `users.py` — perfil do usuario persistido em `data/users.json`. Patch real de perfil persiste
  alteracoes. Settings mantidas em memoria (`_settings_state`) ate Fase 2.
- `chat.py` — `POST /v1/chat/conversations/:id/messages` integra GPT-4o-mini via SDK `openai`.
  Prompt de sistema padrao configura IA como especialista biblico em Portugues.
  Fallback mock automatico quando `OPENAI_API_KEY` nao esta configurada.

**Arquivos de dados criados em `back-end/data/`:**

- `patients.json` — pacientes terapeuticos (seeded pelos mocks do therapist).
- `posts.json` — posts coletados pelo scraper.
- `favorites.json` — favoritos da biblioteca por usuario.
- `users.json` — perfil do usuario autenticado.
- `etl_runs.json` — historico das execucoes de ETL.

**Dependencias adicionadas ao `pyproject.toml`:**

- `openai>=2.21.0` — SDK oficial para integracao GPT-4o-mini.
- `beautifulsoup4>=4.14.3` — parsing HTML para o scraper.

**Variavel de ambiente adicionada ao `.env.example`:**

- `OPENAI_API_KEY=sk-...` — obrigatoria para chat real; opcional (usa mock) se ausente.

**Configuracao:**

- `config.py`: adicionado `extra="ignore"` no `SettingsConfigDict` para aceitar variaveis
  extras no `.env` sem erros de validacao.

---

## Etapa 13 — Migracao para PostgreSQL com SQLAlchemy 2.0 e Alembic (2026-02-21)

**Objetivo:** Implementar a camada de persistencia real com PostgreSQL (Fase 2), substituindo
os arquivos JSON locais por modelos SQLAlchemy 2.0 async, repositorios por dominio, servicos
de negocio e migracoes versionadas com Alembic. Testes de contrato atualizados para 50+
casos com mocks de dependencia de banco.

### Infraestrutura de banco (`app/core/database.py`)

- Engine async criada via `create_async_engine` apontando para `DATABASE_URL` do `.env`.
- Session factory `async_sessionmaker` com `expire_on_commit=False`.
- Dependencia `get_db` injetavel via `Depends` em qualquer endpoint.

### Modelos SQLAlchemy (`app/models/`)

- `base.py` — `BaseModel` com `id: UUID`, `created_at` e `updated_at` gerados automaticamente.
- `user.py` — `User`, `RefreshToken`, `PasswordResetToken`, `UserSettings`.
- `post.py` — `Post`, `PostTag`.
- `library.py` — `Favorite`, `ReadingHistory`.
- `chat.py` — `Conversation`, `Message`.

### Repositorios (`app/repositories/`)

Repositorios assincronos por dominio encapsulando queries SQLAlchemy:

- `user_repository.py` — CRUD de usuarios, busca por email, gerenciamento de refresh tokens.
- `post_repository.py` — feed paginado, busca por ID, tags.
- `library_repository.py` — favoritos e historico por usuario.
- `chat_repository.py` — conversas e mensagens por usuario.

### Servicos de negocio (`app/services/`)

Logica de negocio isolada dos endpoints e dos repositorios:

- `auth_service.py` — signup com hash Argon2, login com verificacao de senha, emissao de tokens.
- `user_service.py` — perfil, settings, atualizacao de dados.
- `post_service.py` — listagem de feed, detalhe de post.
- `library_service.py` — adicionar/remover favoritos, historico.
- `chat_service.py` — criacao de conversa, envio de mensagem com GPT-4o-mini.

### Migracoes Alembic (`migrations/versions/`)

Tres migracoes versionadas e encadeadas:

1. `df122fb2dd78` — Cria tabelas de usuarios e autenticacao (`users`, `refresh_tokens`,
   `password_reset_tokens`, `user_settings`).
2. `d98403ced0d7` — Cria tabelas de posts e tags (`posts`, `post_tags`).
3. `dc263afe3007` — Cria tabelas de biblioteca, chat e historico (`favorites`,
   `reading_history`, `conversations`, `messages`).

### Hash de senhas — Argon2

- `passlib[argon2]` adicionado ao `pyproject.toml`.
- `security.py` atualizado com `CryptContext(schemes=["argon2"])` para hash e verificacao.
- Argon2 escolhido por ser o estado da arte em hashing de senhas (vencedor da
  Password Hashing Competition 2015), configuravel em CPU, memoria e paralelismo.

### Testes de contrato atualizados

- `tests/contract/test_endpoints.py` refatorado para usar `dependency_overrides`:
  - `get_current_user_id` substituido por lambda retornando UUID fixo.
  - `get_db` substituido por `AsyncMock` — sem banco real necessario nos testes de contrato.
- Total de testes: 50+ casos cobrindo todos os dominios (incluindo therapist).

### Decisoes arquiteturais documentadas

- `back-end/docs/decisoes-fase2.md` criado com 6 decisoes registradas:
  - SQLAlchemy 2.0 async (descartando SQLModel).
  - Redis adiado para Fase 3.
  - Argon2 para hash de senhas.
  - testcontainers para testes de integracao (Fase 3).
  - Todos os dominios implementados na mesma branch.
  - Base de dados zerada (sem migracao de dados JSON).

### Dependencias adicionadas ao `pyproject.toml`

- `sqlalchemy>=2.0` com extras `asyncio`.
- `psycopg[binary]>=3.1` — driver async nativo para PostgreSQL.
- `alembic>=1.13` — migracoes de schema.
- `passlib[argon2]>=1.7` — hash de senhas.

### Variavel de ambiente adicionada ao `.env.example`

- `DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/vidacomdeus`.

### Commits desta etapa

- `59da88d` — feat: migra back-end para PostgreSQL com SQLAlchemy 2.0, Alembic,
  repositorios, servicos e 50 testes de contrato passando.

---

## Etapa 14 — Monitor de Banco Real, Player de Audio Interativo e Busca no Feed (2026-02-22)

**Branch:** `feat/integracao-banco`

**Objetivo:** Substituir dados mock no painel admin por metricas reais do PostgreSQL,
implementar player de audio interativo (play/pause/seek/progresso) em PostDetail e Home,
adicionar busca funcional no feed da Home e refatorar o chat para usar IDs de conversa
dinamicos.

### Back-end — Etapa 14

**Nova migracao Alembic (`a1b2c3d4e5f6`):**

- Criada tabela `storage_snapshots` com colunas `id`, `measured_at` (timestamptz, `NOW()`)
  `used_bytes` e `total_bytes`.
- Indice em `measured_at` para consultas de range por data.
- Encadeia em `dc263afe3007` (quarta migracao; total agora: 4).

**Endpoints de Admin atualizados (`app/api/v1/admin.py`):**

- `GET /v1/admin/metrics/storage` — agora executa `SELECT pg_database_size(current_database())`
  via SQLAlchemy async; grava snapshot diario idempotente em `storage_snapshots`; retorna
  bytes, GB, percentual calculados a partir do limite configurado em `render_db_size_bytes`.
  Mock `MOCK_STORAGE` removido.
- `GET /v1/admin/metrics/growth` — calcula crescimento dos ultimos 7 dias a partir de
  `storage_snapshots` (DISTINCT ON por data); retorna historico com nomes de dias em pt-BR
  e percentual de variacao. Mock `MOCK_GROWTH` removido.
- `GET /v1/admin/metrics/tables` — **novo endpoint** que consulta `pg_stat_user_tables`
  retornando tamanho total, de dados e de indices de cada tabela (top 15 por tamanho).
- `GET /v1/admin/alerts` — agora gera alertas dinamicamente com base no uso real:
  limiares info (<70%), warning (>=70%), critical (>=85%). Alerta de falha ETL baseado
  no ultimo registro de `etl_runs.json`. Mock `MOCK_ALERTS` removido.

**Novos schemas Pydantic (`app/domain/admin/schemas.py`):**

- `TableStat` — `table_name`, `total_bytes`, `data_bytes`, `index_bytes`, `total_mb`,
  `rows_estimate`.
- `TableBreakdownResponse` — `tables: list[TableStat]`, `measured_at`.

**Configuracao (`app/core/config.py`):**

- Novo campo `render_db_size_bytes: int` (padrao `1_073_741_824` — 1 GB / Render Free).
- Constantes de plano documentadas nos comentarios: Free 1 GB, Starter 10 GB, Standard 35 GB.

**Variavel de ambiente (`.env.example`):**

- `RENDER_DB_SIZE_BYTES=1073741824` — configura o limite do plano Render para calculo de percentual.

### Front-End — Etapa 14

**Novos tipos e metodos em `src/lib/api.ts`:**

- `TableStat`, `TableBreakdownResponse` — espelham schemas do admin.
- `Conversation`, `ConversationListResponse` — suportam listagem de conversas.
- `adminApi.getTableMetrics()` — `GET /admin/metrics/tables`.
- `chatApi` refatorado: `listConversations()`, `createConversation()`, `getMessages(conversationId)`,
  `sendMessage(conversationId, content)`. Antes: ID fixo `conv-001`; agora: ID dinamico.

**Novas funcoes utilitarias em `src/lib/utils.ts`:**

- `formatLocalDate(iso)` — formata data UTC para fuso local do browser em pt-BR ("DD/MM/AAAA").
- `formatLocalDateTime(iso)` — formata data+hora UTC para fuso local ("DD/MM/AAAA, HH:MM").
- `timeAgoLocal(iso)` — tempo relativo (minutos, horas) ou data/hora local quando >= 24h.
  Substitui `timeAgo()` inline que estava em `AdminDatabaseMonitor.tsx`.

**Novas animacoes CSS em `src/index.css`:**

- `@keyframes bounce-in` — entrada com spring (overshoot + damping).
- `@keyframes float` — flutuacao suave de 6px para cima e para baixo.
- Variaveis CSS `--animate-bounce-in` e `--animate-float` adicionadas ao bloco `@theme`.

**`AdminDatabaseMonitor.tsx` — redesenhado:**

- Grafico SVG de crescimento agora e gerado dinamicamente a partir do historico real via
  funcao `buildChartPaths()` (curva Bezier cubica suavizada). Antes: pontos estaticos hardcoded.
- Novo card "Tabelas do Banco" exibindo tamanho e estimativa de linhas por tabela.
- Tres limiares de cor para a barra de storage: `bg-blue-500` (normal), `bg-orange-500`
  (>=70%), `bg-red-500` (>=85%). Badge "Alerta" / "Critico" correspondentes.
- Subtitulo do card mostra o plano Render detectado automaticamente (`renderPlanLabel()`).
- Helpers `fmtStorage()`, `renderPlanLabel()`, `fmtTableBytes()` extraidos para escopo do modulo.
- `timeAgo()` inline substituido por `timeAgoLocal()` de `utils.ts`.

**`Home.tsx` — busca e player de audio:**

- Topbar recebe `searchQuery` e `onSearchChange` como props (antes: input decorativo sem estado).
- Botao de microfone removido; substituido por botao de limpar busca (x) que aparece quando
  ha texto digitado.
- `RecentPostsSection` filtra posts localmente por titulo, referencia, categoria e tags.
  Titulo da secao muda para `Resultados para "..."` durante busca.
  Botao "Ver tudo"/"Ver menos" controla exibicao de mais de 3 posts (INITIAL_VISIBLE = 3).
  Estado vazio exibe mensagem quando nenhum post bate com a busca.
- `HeroCard` e `ChatCTA` ocultados durante busca ativa.
- `HeroCard` ganhou player de audio interativo:
  - `AudioState`: `"idle" | "loading" | "playing" | "paused" | "unavailable"`.
  - Ao clicar em Play, busca `GET /v1/posts/:id` para obter `audio_url`; cria `Audio` nativo.
  - Botao alterna entre Play, Pause e estados de loading/indisponivel com icones correspondentes.
  - Audio parado ao desmontar o componente (`useEffect` cleanup).
- Cards de posts recentes (`RecentPost`) redesenhados:
  - Layout horizontal com imagem lateral de largura fixa (`w-36`, `min-h-[130px]`).
  - Gradiente sutil na borda direita da imagem.
  - Referencia biblica e categoria exibidas abaixo do titulo.
  - Link "Ler" com ChevronRight no rodape do card.
  - Badge "Novo" e estrela de destaque em linha separada.
- `PostSkeleton` atualizado para espelhar o novo layout dos cards.
- Avatar fallback trocado por SVG inline de silhueta generica (consistente com `/configuracoes`).

**`PostDetail.tsx` — player de audio real:**

- `AudioPlayer` completamente reimplementado:
  - `useRef<HTMLAudioElement>` para controle do elemento de audio nativo.
  - `AudioState`: `"idle" | "playing" | "paused" | "unavailable"`.
  - Barra de progresso clicavel (`handleSeek`) — calcula proporcao por `clientX`.
  - Exibe tempo atual e tempo restante em formato `M:SS`.
  - Botao play/pause com icones `Play`/`Pause` do lucide-react.
  - `audio.onloadedmetadata`, `audio.ontimeupdate`, `audio.onended`, `audio.onerror` para
    sincronizar estado.
  - Desabilitado quando `audio_url` e null (exibe opacidade reduzida).
  - Cleanup no `useEffect` para parar o audio ao sair da pagina.
- Layout do player redesenhado: imagem lateral de largura fixa (`w-32`) com gradiente,
  botao play flutuante a direita do cabecalho.
- Icone `Check` adicionado para feedback de acao concluida.

**`BiblicalAIChat.tsx` — ID de conversa dinamico:**

- Estado `conversationId: string | null` adicionado.
- Na montagem: `chatApi.listConversations()` recupera conversas existentes; se nenhuma,
  `chatApi.createConversation()` cria uma nova. ID salvo no estado.
- `handleSend` bloqueado enquanto `conversationId` for `null`.
- Chamadas `chatApi.getMessages(convId)` e `chatApi.sendMessage(conversationId!, text)` com
  ID dinamico (antes: `conv-001` fixo).

**`PatientDetail.tsx`:**

- Data de inicio do paciente formatada via `formatLocalDateTime()` de `utils.ts` (antes:
  `toLocaleDateString("pt-BR")` inline).
