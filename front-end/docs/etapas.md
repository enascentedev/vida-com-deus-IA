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
