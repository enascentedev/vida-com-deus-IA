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

## Documentacao

1. [Registro de Features](./registro-features.md)
