# Registro de Features

Este documento define o padrao oficial para registrar novas features e o motivo
de criacao de cada uma.

## Padrao de Registro (obrigatorio)
Preencha os campos abaixo para cada nova feature.

### Titulo da Feature
- Nome curto e descritivo da feature.

### Motivo da Criacao
- Por que essa feature existe?
- Qual problema resolve ou qual objetivo atende?

### Escopo
- Onde a feature atua (ex.: App, Biblioteca, Backend, Infra, etc).

### Impacto
- O que muda no comportamento do sistema?
- Existe impacto em usuarios ou integracoes?

### Riscos
- Riscos tecnicos, dependencias sensiveis, possiveis regressoes.

### Migracao
- Passos para ativar, atualizar ou migrar.
- Se nao houver, escrever: "Sem migracao."

### Testes
- Como validar a feature.
- Se nao houver, escrever: "Sem testes no momento."

### Referencias
- Links, issues, PRs, documentacao externa.
- Se nao houver, escrever: "Sem referencias."

---

## Templates (copiar e preencher)

### Template — Feature
```
Titulo da Feature:
Motivo da Criacao:
Escopo:
Impacto:
Riscos:
Migracao:
Testes:
Referencias:
```

---

## Registros

### [Data: 2026-02-02] — Atualizacao do Tailwind para v4

Motivo da Criacao:

- Modernizar o stack de estilos e acompanhar melhorias de performance,
  compatibilidade e manutencao do Tailwind.

Escopo:

- App principal e biblioteca `vida-com-deus-ui`.

Impacto:

- Atualizacao do pipeline de build (PostCSS) e possiveis ajustes em configuracoes
  e estilos globais.

Riscos:

- Quebra de build por incompatibilidades com plugins e mudancas na API do
  Tailwind v4.

Migracao:

- Atualizar dependencias para Tailwind v4.
- Trocar plugin PostCSS para `@tailwindcss/postcss`.
- Revisar `tailwind.config.js` e `src/index.css`.
- Validar geracao de classes para componentes da biblioteca.

Testes:

- `npm run dev`
- `npm run build`
- Validar telas principais e componentes do `vida-com-deus-ui`.

Referencias:

- Sem referencias.

---

### [Data: 2026-02-02] — Padrao de registro de features

Motivo da Criacao:

- Estabelecer um processo formal e rastreavel para documentar novas features,
  garantindo que cada mudanca tenha contexto, riscos e passos de migracao registrados.

Escopo:

- Documentacao do projeto (`docs/`).

Impacto:

- Toda nova feature passa a ter um registro obrigatorio com template padronizado.
- Facilita onboarding de novos contribuidores e auditoria de decisoes tecnicas.

Riscos:

- Nenhum risco tecnico. Risco de processo: registro ser ignorado sem revisao.

Migracao:

- Sem migracao.

Testes:

- Sem testes no momento.

Referencias:

- Sem referencias.

---

### [Data: 2026-02-02] — Reescrita do README do projeto

Motivo da Criacao:

- Substituir o README generico do template Vite por uma documentacao que
  apresente o projeto, suas decisoes tecnicas, arquitetura e instrucoes de uso.

Escopo:

- `README.md` na raiz do repositorio.

Impacto:

- Primeira impressao do repositorio agora reflete o projeto real.
- Inclui visao geral, motivacao da v2 (Vue → React), tech stack, arquitetura
  de dois pacotes, instrucoes de instalacao e aprendizados.

Riscos:

- Nenhum risco tecnico. Apenas documentacao.

Migracao:

- Sem migracao.

Testes:

- Sem testes no momento.

Referencias:

- Sem referencias.

---

### [Data: 2026-02-19] — Navegacao com React Router

Motivo da Criacao:

- O app nao possuia sistema de navegacao entre telas. Com a criacao de multiplas
  paginas, era necessario um roteador client-side para gerenciar transicoes de
  URL e historico de navegacao.

Escopo:

- App principal (`src/App.tsx`, `package.json`).

Impacto:

- `App.tsx` passou de renderizacao direta de `<Home />` para um `<BrowserRouter>`
  com `<Routes>` declarando todas as rotas do app.
- Instalado `react-router-dom` como dependencia de producao.
- Todos os componentes que precisam de navegacao passaram a usar `useNavigate`
  e `useLocation` do react-router-dom.

Riscos:

- Em modo de producao com servidor estatico, rotas que nao sejam `/` podem
  retornar 404 se o servidor nao estiver configurado para redirecionar ao
  `index.html`. Requer configuracao de fallback no servidor de deploy.

Migracao:

- Instalar dependencia: `npm install react-router-dom`.
- Envolver o app com `<BrowserRouter>` em `App.tsx`.
- Substituir renderizacao direta de paginas por `<Routes>/<Route>`.

Testes:

- `npm run build` sem erros de TypeScript.
- Navegar entre rotas verificando que cada pagina carrega corretamente.

Referencias:

- Sem referencias.

---

### [Data: 2026-02-19] — Componentes de Layout Compartilhados

Motivo da Criacao:

- `Home.tsx` definia `BottomNavigation` internamente. Com multiplas paginas
  precisando da mesma navegacao inferior e de uma topbar com botao voltar,
  era necessario extrair esses elementos para componentes reutilizaveis.

Escopo:

- App principal (`src/components/layout/`).

Impacto:

- Criados dois novos componentes de layout:
  - `BottomNavigation`: nav inferior com 4 abas (Inicio, Chat, Biblioteca, Admin),
    detecta automaticamente a aba ativa via `useLocation`.
  - `SecondaryTopbar`: barra superior com botao voltar (`ChevronLeft`), titulo
    centralizado e slot opcional para acoes a direita.
- `Home.tsx` refatorado para usar `BottomNavigation` importado.
- Todas as paginas internas usam `SecondaryTopbar` em vez de topbar proprio.

Riscos:

- `BottomNavigation` usa `useLocation`, portanto deve ser renderizado dentro
  de um contexto `<BrowserRouter>`. Nao pode ser usado fora do roteador.

Migracao:

- Sem migracao para usuarios finais.
- Novos componentes criados em `src/components/layout/BottomNavigation.tsx`
  e `src/components/layout/SecondaryTopbar.tsx`.

Testes:

- Navegar entre as abas e verificar que o item ativo e destacado corretamente.
- Pressionar botao voltar no `SecondaryTopbar` e verificar navegacao correta.

Referencias:

- Sem referencias.

---

### [Data: 2026-02-19] — Implementacao dos Layouts de Telas

Motivo da Criacao:

- O projeto possuia apenas Home e Login implementadas. Com os designs aprovados
  em `docs/designer/`, era necessario implementar todas as telas do app para
  ter uma base navegavel e fiel ao visual definido.

Escopo:

- App principal (`src/pages/`, `src/components/auth/`).

Impacto:

- Criadas 8 novas paginas baseadas nos designs em `docs/designer/`:
  - `LandingPage` — pagina de marketing publica com hero, "Como funciona",
    CTA e footer.
  - `SignUp` — formulario de cadastro com nome, email, senha, confirmacao,
    termos e botoes sociais (Google, Apple).
  - `PasswordRecovery` — recuperacao de senha com campo de email, botao de
    envio e banner de sucesso interativo.
  - `PostDetail` — detalhe do post com player de audio, versículo destacado,
    tabs (Resumo/Tags/Devocional) e FAB de chat com IA.
  - `BiblicalAIChat` — interface de chat com bolhas de usuario e IA, citacoes
    biblicas expansiveis, chips de sugestao e campo de input.
  - `Favorites` — biblioteca com abas Favoritos/Historico, busca, chips de
    filtro, lista de items e estado vazio.
  - `AccountSettings` — configuracoes com perfil, seletor de tema
    (Light/Dark/System) e toggles de IA e notificacoes.
  - `AdminDatabaseMonitor` — painel admin com card de capacidade de
    armazenamento, grafico SVG de crescimento, tabela ETL e alertas.
- `LoginForm` atualizado com navegacao funcional para `/cadastro` e
  `/recuperar-senha`.
- `Home.tsx` refatorado com navegacao para `/post/:id` e `/chat`.

Riscos:

- As paginas contem dados estaticos (mock). Integracao com API real pode
  requerer ajustes nos tipos de props e estados.
- O grafico SVG em `AdminDatabaseMonitor` e estatico; uma solucao dinamica
  exigira biblioteca de graficos (ex.: Recharts).

Migracao:

- Sem migracao.
- Novos arquivos em `src/pages/`: `LandingPage.tsx`, `SignUp.tsx`,
  `PasswordRecovery.tsx`, `PostDetail.tsx`, `BiblicalAIChat.tsx`,
  `Favorites.tsx`, `AccountSettings.tsx`, `AdminDatabaseMonitor.tsx`.

Testes:

- `npm run build` sem erros de TypeScript (validado: build limpo, 330kB).
- Navegar por cada rota e verificar fidelidade ao design em `docs/designer/`.
- Testar estados interativos: tabs em PostDetail, toggles em AccountSettings,
  busca em Favorites, estado de sucesso em PasswordRecovery.

Referencias:

- Designs de referencia: `docs/designer/` (18 subpastas com `screen.png` e `code.html`).

---

### [Data: 2026-02-19] — Script de Capturas de Tela (Playwright)

Motivo da Criacao:

- Necessidade de documentar visualmente o estado atual de cada tela da aplicacao
  em diferentes viewports, facilitando revisoes de design, deteccao de regressoes
  visuais e comunicacao de progresso com stakeholders.

Escopo:

- Infraestrutura de testes e scripts (`scripts/screenshot-routes.py`).

Impacto:

- Gerada a pasta `screenshots/` (ignorada pelo git) contendo subpastas nomeadas
  com o timestamp de cada execucao.
- Cada execucao produz 20 imagens: 10 rotas × 2 viewports (desktop 1280×800 e
  mobile iPhone 11 390×844 DPR 2×).
- Nao afeta o bundle de producao nem o codigo da aplicacao.

Riscos:

- Requer `playwright` e Chromium instalados localmente (`pip install playwright &&
  python -m playwright install chromium`).
- A rota `/post/:id` e capturada com id `1` (dado estatico); quando houver dados
  reais, o id devera ser ajustado no script.

Migracao:

- Instalar dependencia Python: `pip install playwright`.
- Instalar browser: `python -m playwright install chromium`.
- Executar com: `python with_server.py --server "npm run dev" --port 5173 -- python scripts/screenshot-routes.py`.

Testes:

- Verificar que o diretorio `screenshots/{timestamp}/desktop/` e `.../mobile-iphone11/`
  contem 10 arquivos `.png` cada apos a execucao.

Referencias:

- Sem referencias.

---

### [Data: 2026-02-20] — Reorganizacao em Monorepo (PR #2)

Motivo da Criacao:

- O projeto cresceu e passou a ter front-end e back-end. Manter ambos na raiz
  dificultaria CI/CD independente e a separacao de responsabilidades. A organizacao
  em monorepo diretorizado permite pipelines e configuracoes isoladas por camada.

Escopo:

- Estrutura de diretorios do repositorio (raiz → `front-end/`).

Impacto:

- Todos os arquivos do front-end foram movidos para `front-end/`.
- Raiz do repositorio passou a conter apenas `front-end/`, `back-end/` e arquivos
  globais (`README.md`, `.gitignore`).
- Scripts, documentacao e configs do front-end passaram a residir sob `front-end/`.

Riscos:

- Paths relativos em scripts e configs precisavam ser revisados apos a movimentacao.
- Ferramentas que assumem a raiz como base (ex.: Vite, tsconfig) continuam corretas
  pois sao executadas a partir de `front-end/`.

Migracao:

- Executar comandos do front-end a partir de `front-end/` (ex.: `cd front-end && npm run dev`).
- Atualizar qualquer script externo que referencie caminhos da raiz.

Testes:

- `npm run dev` e `npm run build` a partir de `front-end/` sem erros.

Referencias:

- PR #2: Refactor — Reorganiza projeto em estrutura monorepo.

---

### [Data: 2026-02-20] — Estrutura Inicial do Back-End FastAPI (PR #3)

Motivo da Criacao:

- O front-end precisava de uma API real para substituir os dados mockados das paginas.
  A Fase 1 estabelece o contrato de API (endpoints, schemas, autenticacao JWT) com
  dados mockados, permitindo que o front-end integre antes do banco de dados estar pronto.

Escopo:

- Back-end (`back-end/`) — novo diretorio no monorepo.

Impacto:

- Criada estrutura completa do servidor FastAPI orientada a dominios:
  auth, users, posts, library, chat, admin.
- 40+ testes de contrato validam status HTTP e schemas de todos os endpoints.
- Documentacao interativa disponivel em `http://localhost:8000/docs`.
- Autenticacao JWT implementada (access token 15min, refresh token 7 dias).
- CORS configurado para `localhost:5173` e `localhost:3000`.

Riscos:

- Fase 1 retorna dados mockados. Integracao real com PostgreSQL e Redis esta
  planejada para Fase 2 e exigira migracao de schemas e configuracao de infraestrutura.
- `JWT_SECRET_KEY` deve ser definida no `.env`; ausencia causa erro na inicializacao.

Migracao:

- Instalar `uv`: `pip install uv`.
- Instalar dependencias: `uv sync` a partir de `back-end/`.
- Copiar `.env.example` para `.env` e configurar `JWT_SECRET_KEY`.
- Iniciar servidor: `uv run uvicorn app.main:app --reload`.

Testes:

- `pytest` — todos os testes de contrato devem passar.
- `pytest --cov` — verificar cobertura dos endpoints.
- Acessar `http://localhost:8000/docs` e validar documentacao gerada.

Referencias:

- PR #3: Feat — Estrutura inicial do back-end (FastAPI + dominios).
- `back-end/arquitetura-back-end.md` — decisoes arquiteturais detalhadas.

---

### [2026-02-20] Integração Front-End com Back-End API

Motivo da Criacao:

Todas as páginas usavam dados hardcoded sem conexão com o servidor. Esta feature conecta os
endpoints FastAPI (Fase 1) ao front-end React, implementa autenticação JWT completa via Zustand
e adiciona rotas protegidas.

Escopo:

App principal — `src/lib/api.ts`, `src/store/useAuthStore.ts`,
`src/components/auth/ProtectedRoute.tsx`, `src/App.tsx`, todos os arquivos em `src/pages/`,
`src/components/auth/LoginForm.tsx`, `front-end/.env.example`.

Impacto:

- Nova dependência de produção: `zustand ^5.0.5`.
- Todos os dados das páginas passam a vir da API em `localhost:8000`.
- Rotas autenticadas redirecionam para `/login` sem token válido.
- Tokens JWT em localStorage com prefixo `vida_deus_`.
- Fetch wrapper centralizado com retry automático de token expirado.

Riscos:

- Back-end deve estar rodando em `localhost:8000` para o app funcionar.
- Fase 1: back-end aceita qualquer token (sem validação real de credenciais).
- Loop de refresh se `POST /v1/auth/refresh` retornar 401 continuamente — mitigado pelo
  flag `_isRefreshing` no cliente.

Migracao:

- `npm install` a partir de `front-end/` (zustand já está no `package.json`).
- Criar `front-end/.env` com `VITE_API_BASE_URL=http://localhost:8000/v1`.
- Iniciar back-end: `uv run uvicorn app.main:app --reload` a partir de `back-end/`.

Testes:

- `npm run build` sem erros TypeScript.
- Acessar `/` sem token → redirecionado para `/login`.
- Login com qualquer email/senha → feed carregado da API → dados do mock aparecem.
- `/configuracoes` → nome `Gabriel Santos` vindo de `GET /v1/users/me`.
- Logout → tokens removidos do localStorage → redirecionado para `/login`.
- `/admin` → storage 70%, ETL runs e alertas da API.
- Botão "Executar ETL" → `POST /v1/admin/etl/runs/execute` status 202 → lista atualizada.

Referencias:

- `back-end/arquitetura-back-end.md` — contratos de API e schemas Pydantic.
- `http://localhost:8000/docs` — Swagger UI com todos os endpoints.
- `front-end/.claude/agents/api-integration-specialist.md` — agente de implementação.

---

### [2026-02-20] Cliente HTTP centralizado (api.ts)

Motivo da Criacao:

- Cada página precisaria reimplementar fetch, injeção de token, tratamento de erro e lógica
  de refresh de forma independente. Um cliente centralizado elimina duplicação e garante
  comportamento consistente em toda a aplicação.

Escopo:

- App principal (`src/lib/api.ts`).

Impacto:

- Criado fetch wrapper com injeção automática de `Authorization: Bearer <token>` em todas
  as requisições autenticadas.
- Retry automático de 401: tenta `POST /v1/auth/refresh` uma vez; se falhar, dispara
  `CustomEvent("auth:logout")` para notificar o store.
- Flag `_isRefreshing` evita múltiplas tentativas paralelas de refresh.
- 20 tipos TypeScript exportados que espelham os schemas Pydantic do back-end
  (`UserProfile`, `Post`, `FeedResponse`, `LibraryItem`, `ChatMessage`, etc.).
- Funções agrupadas por domínio: `authApi`, `usersApi`, `postsApi`, `libraryApi`,
  `adminApi`, `chatApi`.
- Chaves de localStorage prefixadas com `vida_deus_` (`vida_deus_access_token`,
  `vida_deus_refresh_token`).
- `VITE_API_BASE_URL` lida via `import.meta.env`.

Riscos:

- Se o back-end alterar o contrato de um endpoint, os tipos TypeScript em `api.ts` precisam
  ser atualizados manualmente para manter consistência.
- Tokens armazenados em localStorage são acessíveis via JavaScript — risco de XSS em
  produção; mitigado com `HttpOnly` cookies em Fase 2.

Migracao:

- Criar `front-end/.env` com `VITE_API_BASE_URL=http://localhost:8000/v1`.
- Referência: `front-end/.env.example` (commitado).

Testes:

- `npm run build` sem erros TypeScript.
- Inspecionar aba Network do DevTools e verificar header `Authorization` nas requisições.
- Simular token expirado e confirmar que o refresh ocorre automaticamente.

Referencias:

- `back-end/arquitetura-back-end.md` — contratos de API e schemas Pydantic.
- `http://localhost:8000/docs` — Swagger UI.

---

### [2026-02-20] Auth Store com Zustand (useAuthStore)

Motivo da Criacao:

- O estado de autenticação (usuário logado, token) precisava ser acessível globalmente por
  múltiplas páginas sem prop drilling. Um store global garante fonte única de verdade e
  persistência entre navegações.

Escopo:

- App principal (`src/store/useAuthStore.ts`, `package.json`).

Impacto:

- Instalada dependência `zustand ^5.0.5`.
- Store expõe: `isAuthenticated`, `user: UserProfile | null`.
- Actions: `initFromStorage`, `login`, `signup`, `logout`, `setUser`, `clearAuth`.
- `initFromStorage()`: verifica `vida_deus_access_token` no localStorage e popula o store
  sem chamada extra à API — permite restaurar sessão ao recarregar a página.
- `login()`: chama `POST /v1/auth/login`, salva tokens no localStorage, chama
  `GET /v1/users/me` e popula `user` no store.
- `signup()`: chama `POST /v1/auth/signup` com redirecionamento posterior para `/login`.
- `logout()`: chama `POST /v1/auth/logout`, limpa localStorage e reseta o store.
- Escuta `CustomEvent("auth:logout")` para limpar sessão em caso de falha de refresh
  automático no cliente HTTP.

Riscos:

- Estado não persiste entre abas diferentes do mesmo browser (Zustand por padrão é
  in-memory por aba); `initFromStorage` mitiga ao reler o localStorage na montagem.
- Se localStorage for limpo externamente (DevTools), `isAuthenticated` pode ficar
  desatualizado até a próxima montagem.

Migracao:

- `npm install` a partir de `front-end/` (zustand já adicionado ao `package.json`).
- Chamar `useAuthStore.getState().initFromStorage()` na montagem do `App.tsx`.

Testes:

- Login → recarregar página → usuário ainda autenticado (sessão restaurada).
- Logout → `vida_deus_access_token` removido do localStorage → redirecionado para `/login`.
- Token expirado → refresh automático via `api.ts` → `CustomEvent("auth:logout")` se falhar.

Referencias:

- [Zustand v5](https://zustand.docs.pmnd.rs/)

---

### [2026-02-20] ProtectedRoute (proteção de rotas autenticadas)

Motivo da Criacao:

- Páginas autenticadas (Home, PostDetail, Favorites, etc.) eram acessíveis sem login.
  Era necessário um mecanismo declarativo para proteger essas rotas no React Router v7.

Escopo:

- App principal (`src/components/auth/ProtectedRoute.tsx`, `src/App.tsx`).

Impacto:

- Criado `ProtectedRoute` que usa `<Outlet />` do React Router v7.
- Lê `isAuthenticated` do `useAuthStore`.
- Redireciona para `/login` com `<Navigate replace />` se o usuário não estiver autenticado.
- `App.tsx` agrupa 6 rotas autenticadas sob um único `<Route element={<ProtectedRoute />}>`:
  `/`, `/post/:id`, `/chat`, `/biblioteca`, `/configuracoes`, `/admin`.
- `App.tsx` chama `initFromStorage()` em `useEffect` na montagem para restaurar sessão
  antes que o `ProtectedRoute` avalie `isAuthenticated`.

Riscos:

- Se `initFromStorage()` for assíncrono no futuro (ex.: validação de token com a API),
  pode haver um flash de redirecionamento para `/login` antes da sessão ser restaurada.
  Solução futura: adicionar estado `isHydrating` ao store.

Migracao:

- Sem migração para usuários finais.
- Rotas protegidas devem ser aninhadas sob `<Route element={<ProtectedRoute />}>` em `App.tsx`.

Testes:

- Acessar `/` sem token no localStorage → redirecionado para `/login`.
- Acessar `/login` com token válido → acesso liberado ao feed.
- Limpar localStorage manualmente → recarregar `/biblioteca` → redirecionado para `/login`.

Referencias:

- [React Router v7 — Outlet](https://reactrouter.com/api/components/Outlet)

---

### [2026-02-20] Feed conectado à API real (Home.tsx)

Motivo da Criacao:

- A página Home exibia posts hardcoded. Conectar ao endpoint `GET /v1/posts/feed` permite
  que o conteúdo seja gerenciado pelo back-end e preparar a integração para dados reais
  na Fase 2.

Escopo:

- App principal (`src/pages/Home.tsx`).

Impacto:

- `useEffect` busca `GET /v1/posts/feed` ao montar o componente.
- Durante carregamento, exibe componentes `Skeleton` (da `vida-com-deus-ui`) no lugar dos cards.
- Posts renderizados a partir da resposta da API (`FeedResponse`).
- Avatar do usuário logado lido do `useAuthStore` em vez de valor fixo.
- Tratamento de erro com mensagem inline se a requisição falhar.

Riscos:

- Se o back-end estiver offline, a página exibe erro mas não redireciona; comportamento
  intencional para diferenciar de falta de autenticação.

Migracao:

- Sem migração. Back-end deve estar rodando em `localhost:8000`.

Testes:

- Abrir `/` autenticado → Skeletons exibidos → posts do mock aparecem.
- Desligar o back-end → mensagem de erro exibida → app não trava.

Referencias:

- Endpoint: `GET /v1/posts/feed` — `back-end/arquitetura-back-end.md`.

---

### [2026-02-20] PostDetail conectado à API com toggle favorito otimista

Motivo da Criacao:

- A página PostDetail exibia conteúdo estático. Conectar ao endpoint `GET /v1/posts/:id`
  carrega o post correto com base no parâmetro de URL. O toggle de favorito otimista
  melhora a experiência do usuário evitando espera visual.

Escopo:

- App principal (`src/pages/PostDetail.tsx`).

Impacto:

- `useParams` extrai o `id` da URL e chama `GET /v1/posts/:id`.
- Skeleton exibido durante carregamento do post.
- Botão de favorito alterna o estado localmente de forma imediata (otimista) e envia
  `POST /v1/library/favorites/:id` ou `DELETE /v1/library/favorites/:id` em background.
- Em caso de erro na requisição, o estado otimista é revertido.

Riscos:

- Revert do estado otimista pode gerar inconsistência visual breve se a rede for lenta.
- ID do post vindo da URL deve corresponder a um post existente na API mock; IDs
  inexistentes retornam 404 (tratado com mensagem de erro).

Migracao:

- Sem migração.

Testes:

- Navegar para `/post/1` → post "Paz que Excede o Entendimento" carregado da API.
- Clicar no botão de favorito → ícone altera imediatamente → requisição enviada em background.
- Simular erro de rede no toggle → estado revertido ao valor anterior.

Referencias:

- Endpoints: `GET /v1/posts/:id`, `POST /v1/library/favorites/:id`,
  `DELETE /v1/library/favorites/:id`.

---

### [2026-02-20] Biblioteca conectada à API com delete otimista

Motivo da Criacao:

- A página Favorites exibia itens estáticos. Conectar ao endpoint `GET /v1/library/` traz
  os itens reais do usuário. O delete otimista remove o item visualmente de imediato,
  tornando a interface mais responsiva.

Escopo:

- App principal (`src/pages/Favorites.tsx`).

Impacto:

- `useEffect` busca `GET /v1/library/?tab=favorites` ou `GET /v1/library/?tab=history`
  conforme a aba ativa.
- Skeleton exibido durante carregamento.
- Botão de exclusão remove o item localmente de forma imediata (otimista) e envia
  `DELETE /v1/library/favorites/:id` em background.
- Em caso de erro, o item é reinserido na lista.
- Troca de aba (Favoritos/Histórico) dispara novo fetch.

Riscos:

- Revert do delete otimista pode surpreender o usuário se o item reaparecer após erro.
- Busca local por título/subtítulo é client-side; sem suporte a filtro server-side na Fase 1.

Migracao:

- Sem migração.

Testes:

- Abrir `/biblioteca` autenticado → itens da API exibidos.
- Trocar para aba "Histórico" → novo fetch realizado.
- Deletar item → desaparece imediatamente → requisição enviada em background.

Referencias:

- Endpoint: `GET /v1/library/`, `DELETE /v1/library/favorites/:id`.

---

### [2026-02-20] AccountSettings com dados reais e auto-save de settings

Motivo da Criacao:

- A página AccountSettings exibia nome e email fixos. Conectar ao auth store e à API
  traz os dados reais do perfil e persiste as preferências do usuário no servidor.

Escopo:

- App principal (`src/pages/AccountSettings.tsx`).

Impacto:

- Dados do perfil (nome, email, avatar) lidos diretamente do `useAuthStore` sem fetch
  adicional (já populados no login via `GET /v1/users/me`).
- Settings (tema, toggles de IA e notificações) buscados via `GET /v1/users/me/settings`
  na montagem.
- Alteração em qualquer setting dispara `PATCH /v1/users/me/settings` automaticamente
  (auto-save) sem botão de salvar explícito.
- Botão "Sair" chama `useAuthStore.logout()` → limpa localStorage → redireciona para `/login`.

Riscos:

- Auto-save gera múltiplas requisições se o usuário alterar vários toggles rapidamente.
  Solução futura: debounce de 500ms.
- Em Fase 1 o back-end não valida os dados; mudanças de tema não persistem entre sessões
  até integração com banco de dados real na Fase 2.

Migracao:

- Sem migração.

Testes:

- Abrir `/configuracoes` → nome do usuário exibido corretamente (ex.: "Gabriel Santos").
- Alterar toggle de notificações → `PATCH /v1/users/me/settings` enviado (verificar Network).
- Clicar "Sair" → redirecionado para `/login` → token removido do localStorage.

Referencias:

- Endpoints: `GET /v1/users/me`, `GET /v1/users/me/settings`, `PATCH /v1/users/me/settings`.

---

### [2026-02-20] AdminDatabaseMonitor com dados reais de métricas

Motivo da Criacao:

- A página AdminDatabaseMonitor exibia métricas, histórico ETL e alertas estáticos.
  Conectar à API permite monitoramento em tempo quase real e execução de ETL interativa.

Escopo:

- App principal (`src/pages/AdminDatabaseMonitor.tsx`).

Impacto:

- `Promise.all` busca 4 endpoints em paralelo na montagem: `GET /v1/admin/metrics/storage`,
  `GET /v1/admin/etl/runs` (histórico), `GET /v1/admin/alerts` e dados de grafico.
- Barra de progresso de armazenamento reflete o percentual retornado pela API.
- Tabela ETL exibe execuções reais com status colorido e timestamps formatados via `timeAgo()`.
- Tabela de alertas reflete alertas reais do servidor.
- Botão "Executar ETL" chama `POST /v1/admin/etl/runs/execute` (status 202) e recarrega
  o histórico ETL após confirmação.
- Estado de loading e tratamento de erro implementados.

Riscos:

- `Promise.all` falha completamente se qualquer dos 4 endpoints retornar erro; considerar
  `Promise.allSettled` em Fase 2 para resiliência parcial.
- Função `timeAgo()` é client-side e depende do relógio local — pode divergir em ambientes
  com fuso horário diferente.

Migracao:

- Sem migração.

Testes:

- Abrir `/admin` autenticado → métricas reais exibidas (storage 70%).
- Clicar "Executar ETL" → botão desabilitado durante execução → lista atualizada após 202.
- Alertas exibidos conforme retorno de `GET /v1/admin/alerts`.

Referencias:

- Endpoints: `GET /v1/admin/metrics/storage`, `GET /v1/admin/alerts`,
  `POST /v1/admin/etl/runs/execute`.

---

### [2026-02-21] Dashboard do Psicólogo — Gestão de Pacientes

Motivo da Criacao:

- O projeto precisava de uma interface para o psicólogo gerenciar pacientes, sessões
  terapêuticas, diretrizes para IA e controle de mensagens. O dashboard centraliza
  todas essas funcionalidades em uma nova rota `/gestao`, separada do painel admin.

Escopo:

- Back-end (`back-end/app/domain/therapist/`, `back-end/app/api/v1/therapist.py`).
- Front-end (`src/pages/TherapistDashboard.tsx`, `src/components/therapist/`,
  `src/lib/api.ts`, `src/App.tsx`, `src/components/layout/BottomNavigation.tsx`).

Impacto:

- Novo domínio `therapist` no back-end com 11 schemas Pydantic e 10 endpoints REST.
- Dados persistidos em `data/patients.json` via `core/storage.py` (Fase 1).
- 13 novos tipos TypeScript e objeto `therapistApi` no cliente HTTP.
- Nova rota `/gestao` com rotas aninhadas via React Router v7 (`<Outlet />`):
  `/gestao` (overview), `/gestao/pacientes`, `/gestao/pacientes/:id`, `/gestao/intake`.
- `TherapistDashboard.tsx` funciona como layout wrapper com header e bottom nav.
- 5 abas no `BottomNavigation` (Início, Chat, Biblioteca, Gestão, Admin).
- Detecção de aba ativa via `pathname.startsWith("/gestao")`.
- Formulário de intake com 4 blocos (identificação, avaliação clínica, diretrizes IA,
  primeira sessão), seleção visual com pills e emojis, input de tags, slider de limite.
- Ficha de paciente com 5 seções (status, cota, diretrizes editáveis, sessões, clínica).
- Modal de sessão (criar/editar) com humor via emojis, tags e textarea.
- 21 novos testes de contrato (happy path + validação 422).

Riscos:

- Em Fase 1, endpoints `/v1/therapist/` usam `get_current_user_id` sem verificação
  de role — qualquer usuário autenticado pode acessar. Autorização por role planejada
  para Fase 2 (`require_therapist_role`).
- Aba "Gestão" visível para todos os usuários até implementação de renderização
  condicional por role via `useAuthStore` (Fase 2).
- Persistência JSON não suporta concorrência — adequado apenas para Fase 1.

Migracao:

- Sem migração para usuários finais.
- Novos arquivos criados; arquivos existentes do admin e demais rotas preservados.
- `npm run build` e `pytest` devem passar sem erros.

Testes:

- `pytest tests/contract/test_endpoints.py` — 21 novos testes na seção Therapist.
- `npm run build` sem erros TypeScript (validado).
- Navegar por `/gestao` → overview com contadores e pacientes perto do limite.
- `/gestao/pacientes` → lista com filtro por status, navegação para ficha.
- `/gestao/intake` → formulário completo, submissão cria paciente e navega para ficha.
- `/gestao/pacientes/:id` → ficha com edição de status, limite, diretrizes e sessões.

Referencias:

- `back-end/app/domain/therapist/schemas.py` — 11 schemas Pydantic.
- `back-end/app/api/v1/therapist.py` — 10 endpoints mock com persistência JSON.
- Plano: `.cursor/plans/dashboard_do_psicologo_980b522d.plan.md`.

---

### [2026-02-20] BiblicalAIChat migrado para chatApi

Motivo da Criacao:

- A página BiblicalAIChat simulava respostas locais sem persistência. Migrar para `chatApi`
  conecta o chat ao back-end, permitindo histórico de conversas e base para integração
  com LLM real na Fase 2.

Escopo:

- App principal (`src/pages/BiblicalAIChat.tsx`).

Impacto:

- Ao abrir a página, cria ou recupera uma conversa via `POST /v1/chat/conversations`.
- Histórico de mensagens carregado via `GET /v1/chat/conversations/:id/messages`.
- Envio de mensagem chama `POST /v1/chat/conversations/:id/messages` e exibe a resposta
  da IA retornada pela API.
- Avatar do usuário logado lido do `useAuthStore`.
- Estado de loading com animação de dots mantido durante aguardo da resposta da API.
- Chips de sugestão e citações bíblicas renderizados a partir da resposta da API.

Riscos:

- Em Fase 1 a API retorna respostas mock sem LLM real; o comportamento mudará
  significativamente na Fase 2 com integração ao modelo de IA.
- Se `POST /v1/chat/conversations` falhar, o usuário não consegue enviar mensagens;
  tratamento de erro com botão de retry planejado para Fase 2.

Migracao:

- Sem migração.

Testes:

- Abrir `/chat` autenticado → conversa iniciada ou recuperada da API.
- Digitar mensagem e enviar → resposta mock da IA exibida.
- Recarregar a página → histórico da conversa restaurado via `GET .../messages`.

Referencias:

- Endpoints: `POST /v1/chat/conversations`,
  `GET /v1/chat/conversations/:id/messages`,
  `POST /v1/chat/conversations/:id/messages`.

---

### [2026-02-21] ETL de Scraping — wgospel.com

Motivo da Criacao:

- O feed de posts era totalmente mock e estatico. Para oferecer conteudo biblico real e
  atualizado, foi criado um ETL que coleta reflexoes diarias do site wgospel.com/tempoderefletir/
  e as persiste localmente para consumo pelo endpoint de feed.

Escopo:

- Back-end (`back-end/app/core/scraper.py`, `back-end/app/core/storage.py`,
  `back-end/app/api/v1/admin.py`, `back-end/app/api/v1/posts.py`).
- Dados: `back-end/data/posts.json`, `back-end/data/etl_runs.json`.

Impacto:

- `POST /v1/admin/etl/runs/execute` dispara scraping real de ate 20 posts da listagem.
  Cada post tem sua pagina individual acessada para extrair corpo devocional, oracao e audio.
- IDs deterministicos via `uuid.uuid5(NAMESPACE_URL, href)` evitam duplicatas entre execucoes.
- Merge com JSON existente: novos posts adicionados, posts antigos preservados.
- `GET /v1/posts/feed` e `GET /v1/posts/:id` usam dados reais quando `posts.json` existe;
  fallback automatico para mock se o arquivo estiver ausente.
- `GET /v1/admin/etl/runs` le historico real de `etl_runs.json` (ultimas 20 execucoes).
- Novo campo `source_url` e `body_text` no schema `PostDetail`.

Riscos:

- Dependente da estrutura HTML do wgospel.com: mudancas no layout do site podem quebrar
  os seletores CSS (`div.post-item`, `h2.entry-title a`, etc.).
- Scraping sequencial (sem concorrencia): execucao pode ser lenta para 20 posts.
- Paragrafos promocionais filtrados via lista de marcadores estaticos — lista pode ficar
  desatualizada se o site alterar o texto promocional.
- Sem autenticacao de role no endpoint ETL: qualquer usuario autenticado pode disparar
  o scraping (mitigar na Fase 2 com `require_admin_role`).

Migracao:

- Instalar dependencias: `uv sync` (adiciona `beautifulsoup4` e `openai`).
- Sem migracao de dados — `data/posts.json` sera criado na primeira execucao do ETL.
- Executar `POST /v1/admin/etl/runs/execute` uma vez para popular o feed com dados reais.

Testes:

- `pytest tests/contract/test_endpoints.py` — testes de ETL ja existentes passam.
- Com servidor rodando: `POST /v1/admin/etl/runs/execute` deve retornar status `success`
  e `posts_collected > 0`.
- `GET /v1/posts/feed` deve retornar posts reais apos execucao bem-sucedida do ETL.
- `GET /v1/admin/etl/runs` deve exibir a execucao com duracao real.

Referencias:

- Fonte: `https://www.wgospel.com/tempoderefletir/`
- `back-end/app/core/scraper.py` — logica de scraping.
- `back-end/app/core/storage.py` — utilitario JSON centralizado.
- Endpoints: `POST /v1/admin/etl/runs/execute`, `GET /v1/posts/feed`, `GET /v1/posts/:id`.

---

### [2026-02-21] Integracao OpenAI GPT-4o-mini no Chat Biblico

Motivo da Criacao:

- O chat biblico retornava respostas mock identicas para qualquer pergunta. A integracao
  com GPT-4o-mini transforma o chat em um assistente biblico real, com respostas contextuais
  em Portugues baseadas nas escrituras.

Escopo:

- Back-end (`back-end/app/api/v1/chat.py`, `back-end/pyproject.toml`, `back-end/.env.example`).

Impacto:

- `POST /v1/chat/conversations/:id/messages` chama `gpt-4o-mini` com prompt de sistema
  que configura a IA como especialista biblico em Portugues do Brasil (pastoral, respeitoso,
  cita livro/capitulo/versiculo).
- Parametros: `max_tokens=600`, `temperature=0.7`.
- Fallback automatico mock quando `OPENAI_API_KEY` nao esta definida — zero alteracao de
  comportamento para ambientes sem a chave.
- IDs de mensagens agora gerados via `uuid.uuid4()` (antes: `f"msg-{_now_iso()}"` podia
  colidir em requests rapidos).
- IDs de conversas agora gerados via `uuid.uuid4()` (antes: `conv-new-001` era fixo).
- Dependencia `openai>=2.21.0` adicionada ao `pyproject.toml`.
- Variavel `OPENAI_API_KEY` adicionada ao `.env.example`.

Riscos:

- Chamada sincrona a API OpenAI: latencia de rede impacta tempo de resposta do endpoint.
  Considerar `asyncio` ou worker em background na Fase 2.
- Custo proporcional ao volume de mensagens — sem throttling ou limite por usuario na Fase 1.
- Citacoes biblicas retornadas como lista vazia (`[]`) na Fase 1 — extracao estruturada
  de referencias planejada para Fase 2.
- Import local de `openai` (`from openai import OpenAI` dentro da funcao) evita erro de
  importacao se a biblioteca nao estiver instalada, mas `uv sync` sempre a instala.

Migracao:

- Adicionar `OPENAI_API_KEY=sk-...` ao `.env` do back-end.
- Executar `uv sync` para instalar `openai`.
- Sem migracao de dados.

Testes:

- Com `OPENAI_API_KEY` ausente: `POST .../messages` retorna resposta mock (Proverbios 3:5-6).
- Com chave valida: resposta real do GPT-4o-mini em Portugues com referencias biblicas.
- `pytest tests/contract/test_endpoints.py` — testes de chat ja existentes passam
  (usam mock porque nao ha chave no ambiente de testes).

Referencias:

- `back-end/app/api/v1/chat.py` — funcao `_call_openai` e `SYSTEM_PROMPT`.
- Documentacao OpenAI: `https://platform.openai.com/docs/api-reference/chat`.
- Endpoint: `POST /v1/chat/conversations/:id/messages`.

---

### [2026-02-21] Persistencia JSON para Usuarios, Favoritos e Perfil

Motivo da Criacao:

- Endpoints de perfil de usuario (`/v1/users/me`) e biblioteca (`/v1/library/`) retornavam
  dados mock estaticos que se perdiam entre reinicializacoes. A persistencia em JSON permite
  que alteracoes de perfil e favoritos sobrevivam ao restart do servidor na Fase 1.

Escopo:

- Back-end (`back-end/app/api/v1/users.py`, `back-end/app/api/v1/library.py`).
- Dados: `back-end/data/users.json`, `back-end/data/favorites.json`.

Impacto:

- `PATCH /v1/users/me` salva perfil atualizado em `data/users.json`.
- `GET /v1/users/me` le de `users.json`; usa perfil mock como fallback se o arquivo nao existir.
- `POST /v1/library/favorites/:id` cria item em `favorites.json` (evita duplicatas por `post_id`).
- `DELETE /v1/library/favorites/:id` remove item de `favorites.json`.
- `GET /v1/library` com `tab=favorites` le de `favorites.json`; historico permanece mock.
- Mock estatico `MOCK_FAVORITES` removido do codigo.
- Settings do usuario mantidas em variavel de modulo em memoria (`_settings_state`) — serao
  migradas para banco na Fase 2.

Riscos:

- Persistencia sem isolamento por usuario: todos os usuarios autenticados compartilham o mesmo
  `users.json` e `favorites.json` (modelo adequado apenas para ambiente de desenvolvimento).
- Sem transacoes: escrita falha em casos de corrida entre requests concorrentes.

Migracao:

- Sem migracao necessaria: arquivos JSON criados automaticamente na primeira escrita.

Testes:

- `PATCH /v1/users/me` → reiniciar servidor → `GET /v1/users/me` retorna dado atualizado.
- `POST /v1/library/favorites/post-001` → `GET /v1/library` com `tab=favorites` exibe o item.
- `DELETE /v1/library/favorites/post-001` → item removido da lista.
- `pytest tests/contract/test_endpoints.py` — todos os testes passam.

Referencias:

- `back-end/app/core/storage.py` — utilitario centralizado de JSON.
- `back-end/app/api/v1/users.py` e `library.py` — implementacao.

---

### [2026-02-21] Migracao para PostgreSQL com SQLAlchemy 2.0 e Alembic

Motivo da Criacao:

- A persistencia em arquivos JSON locais (Fase 1.5) nao suporta concorrencia, nao oferece
  integridade referencial e nao e adequada para producao. A Fase 2 substitui essa camada por
  PostgreSQL real com ORM, repositorios e migracoes versionadas, preparando o back-end para
  escala e autenticacao real com senhas hasheadas.

Escopo:

- Back-end: `app/models/`, `app/repositories/`, `app/services/`, `app/core/database.py`,
  `migrations/`, `back-end/docs/decisoes-fase2.md`, `back-end/.env.example`,
  `back-end/pyproject.toml`, `tests/contract/test_endpoints.py`.

Impacto:

- Adicionadas 4 camadas ao back-end: modelos SQLAlchemy, repositorios, servicos e migracoes.
- Engine async (`create_async_engine`) com sessao injetavel via `Depends(get_db)`.
- 4 modelos de usuario: `User`, `RefreshToken`, `PasswordResetToken`, `UserSettings`.
- 2 modelos de post: `Post`, `PostTag`.
- 4 modelos de biblioteca e chat: `Favorite`, `ReadingHistory`, `Conversation`, `Message`.
- 3 migracoes Alembic encadeadas cobrindo todos os dominios.
- Hash de senhas com Argon2 via `passlib[argon2]`.
- Testes de contrato refatorados: `get_db` e `get_current_user_id` mockados via
  `dependency_overrides` — 50+ casos, sem dependencia de banco nos testes de contrato.
- Decisoes arquiteturais documentadas em `back-end/docs/decisoes-fase2.md`.

Riscos:

- Requer PostgreSQL 15+ instalado e configurado no `.env` (`DATABASE_URL`).
- Endpoints ainda usam persistencia JSON para alguns dominios (therapist, admin ETL) —
  migracao completa para repositorios ocorre progressivamente.
- Engine async incompativel com `TestClient` sincrono do FastAPI — mitiga usando
  `dependency_overrides` para mockar `get_db` nos testes de contrato.

Migracao:

- Instalar PostgreSQL e criar banco de dados.
- Adicionar `DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/vidacomdeus` ao `.env`.
- Executar `uv sync` para instalar novas dependencias (`sqlalchemy`, `psycopg`, `alembic`, `passlib`).
- Aplicar migracoes: `uv run alembic upgrade head` a partir de `back-end/`.

Testes:

- `pytest tests/contract/test_endpoints.py` — 50+ testes devem passar sem banco configurado.
- `uv run alembic upgrade head` sem erros confirma migracoes validas.
- Com banco configurado: `POST /v1/auth/signup` cria usuario com senha hasheada em Argon2.

Referencias:

- `back-end/docs/decisoes-fase2.md` — 6 decisoes arquiteturais documentadas.
- `back-end/migrations/versions/` — 3 migracoes Alembic.
- `back-end/app/models/` — modelos SQLAlchemy 2.0.
- `back-end/app/repositories/` — repositorios por dominio.
- `back-end/app/services/` — servicos de negocio.
- Commit: `59da88d` — feat: migra back-end para PostgreSQL com SQLAlchemy 2.0, Alembic,
  repositorios, servicos e 50 testes de contrato passando.

---

### [Data: 2026-02-22] — Monitor de Storage com Dados Reais do PostgreSQL

Motivo da Criacao:

- O painel admin exibia metricas de armazenamento totalmente mockadas (1.4 GB fixo).
  Para monitorar o uso real do banco hospedado no Render, foi necessario conectar os
  endpoints de admin ao PostgreSQL via `pg_database_size()` e criar uma tabela de
  snapshots diarios para historico de crescimento.

Escopo:

- Back-end: `app/api/v1/admin.py`, `app/domain/admin/schemas.py`, `app/core/config.py`,
  `back-end/.env.example`, nova migracao Alembic `a1b2c3d4e5f6`.
- Front-end: `src/pages/AdminDatabaseMonitor.tsx`, `src/lib/api.ts`.

Impacto:

- `GET /v1/admin/metrics/storage` retorna bytes reais via `pg_database_size()` e grava
  snapshot diario idempotente em `storage_snapshots`.
- `GET /v1/admin/metrics/growth` calcula variacao percentual real dos ultimos 7 dias
  a partir dos snapshots armazenados.
- Novo endpoint `GET /v1/admin/metrics/tables` expoe tamanho e estimativa de linhas
  por tabela via `pg_stat_user_tables`.
- `GET /v1/admin/alerts` gera alertas dinamicos com tres limiares: info (<70%),
  warning (>=70%), critical (>=85%).
- Grafico SVG no front-end e agora gerado dinamicamente (curva Bezier).
- Nova configuracao `RENDER_DB_SIZE_BYTES` permite ajustar o limite do plano Render.

Riscos:

- Endpoints de storage agora dependem de banco real: sem PostgreSQL configurado, os
  endpoints retornam erro 500.
- A tabela `storage_snapshots` e criada pela migracao `a1b2c3d4e5f6` — requer
  `uv run alembic upgrade head` antes de usar os novos endpoints.
- Snapshot diario e idempotente por dia (INSERT WHERE NOT EXISTS): se o servidor for
  reiniciado multiplas vezes no mesmo dia, apenas o primeiro snapshot e gravado.

Migracao:

- Aplicar nova migracao: `uv run alembic upgrade head` a partir de `back-end/`.
- Adicionar `RENDER_DB_SIZE_BYTES=1073741824` ao `.env` (ou ajustar conforme plano Render).

Testes:

- `pytest tests/contract/test_endpoints.py` — testes de contrato existentes devem passar
  (admin mockado via `dependency_overrides`).
- Com banco configurado: `GET /v1/admin/metrics/storage` retorna uso real; verificar que
  `measured_at` esta registrado em `storage_snapshots`.
- `GET /v1/admin/metrics/tables` retorna lista de tabelas com tamanhos nao-zero.
- Abrir `/admin` no front-end e verificar grafico dinamico e card de tabelas exibidos.

Referencias:

- Nova migracao: `back-end/migrations/versions/a1b2c3d4e5f6_cria_tabela_storage_snapshots.py`.
- Documentacao PostgreSQL: `pg_database_size`, `pg_stat_user_tables`.

---

### [Data: 2026-02-22] — Player de Audio Interativo (PostDetail e Home)

Motivo da Criacao:

- O player de audio em PostDetail era apenas um link estatico `<a href>` sem controle
  de reproducao. O card hero da Home tinha um botao Play decorativo sem funcionalidade.
  A feature implementa reproducao real com controle de progresso, play/pause e seek.

Escopo:

- Front-end: `src/pages/PostDetail.tsx`, `src/pages/Home.tsx`.

Impacto:

- `PostDetail` — `AudioPlayer` completamente reimplementado com `useRef<HTMLAudioElement>`:
  - Play/pause real com estado `"idle" | "playing" | "paused" | "unavailable"`.
  - Barra de progresso clicavel (seek por `clientX`).
  - Exibicao de tempo atual e restante em formato M:SS.
  - Desabilitado graciosamente quando `audio_url` for null.
- `Home` — HeroCard com player de audio em tres etapas:
  - Click inicial busca `GET /v1/posts/:id` para obter `audio_url`.
  - Cria `Audio` nativo e dispara reproducao.
  - Botao alterna entre icones Play, Pause, Loader2 e Volume2 conforme estado.
- Audio parado em `useEffect` cleanup ao desmontar os componentes.

Riscos:

- `audio_url` retornado pelo back-end pode ser null ou expirar; estado `"unavailable"`
  sinaliza isso ao usuario.
- Autoplay pode ser bloqueado por politicas do browser em dispositivos iOS quando
  acionado sem gesto do usuario direto.
- Na Home, o primeiro click dispara fetch extra (`GET /v1/posts/:id`) antes de criar
  o `Audio`; latencia de rede adiciona delay visivel.

Migracao:

- Sem migracao de dados. Funciona com qualquer post que tenha `audio_url` preenchido.

Testes:

- Navegar para `/post/:id` com um post que tenha `audio_url` valida → player aparece
  habilitado, botao play inicia reproducao, barra progride, seek funciona.
- Post sem `audio_url` → botao play desabilitado (opacidade 40%).
- Na Home, clicar Play no HeroCard → icone muda para Loader2 → reproducao inicia.
- Navegar para outra pagina enquanto tocando → audio para sem erros de console.

Referencias:

- `front-end/src/pages/PostDetail.tsx` — componente `AudioPlayer`.
- `front-end/src/pages/Home.tsx` — funcao `handlePlayAudio` no `HeroCard`.

---

### [Data: 2026-02-22] — Busca Funcional no Feed da Home

Motivo da Criacao:

- A barra de busca na Home era decorativa (input sem estado, sem filtragem). Adicionar
  busca client-side permite que o usuario encontre reflexoes por titulo, referencia
  biblica, categoria ou tags sem requisicao adicional ao servidor.

Escopo:

- Front-end: `src/pages/Home.tsx`.

Impacto:

- Input de busca controlado (`searchQuery` no estado do componente `Home`).
- Botao de microfone removido; substituido por botao de limpar (x) quando ha texto.
- `RecentPostsSection` filtra a lista de posts em memoria por titulo, referencia,
  categoria e tags (case-insensitive).
- Titulo da secao muda para `Resultados para "..."` durante busca ativa.
- Estado vazio exibe mensagem quando nenhum post corresponde.
- `HeroCard` e `ChatCTA` ocultados enquanto busca esta ativa.
- Botao "Ver tudo"/"Ver menos" controla exibicao de mais de 3 posts (constante
  `INITIAL_VISIBLE = 3`).

Riscos:

- Busca e client-side: so encontra posts ja carregados no feed (ate o limite paginado
  do `GET /v1/posts/feed`). Posts nao carregados nao aparecem nos resultados.
- Sem debounce: re-renderizacao a cada caractere digitado; adequado para listas
  pequenas, pode ser otimizado com `useDeferredValue` para feeds maiores.

Migracao:

- Sem migracao. Feature puramente front-end.

Testes:

- Digitar "Filipenses" na barra de busca → apenas posts com essa referencia exibidos.
- Busca sem resultados → mensagem "Nenhuma reflexao encontrada para ...".
- Limpar busca (botao x) → feed completo restaurado com HeroCard e ChatCTA.
- Clicar "Ver tudo" → todos os posts visiveis; "Ver menos" colapsa para 3.

Referencias:

- `front-end/src/pages/Home.tsx` — `RecentPostsSection` e prop `searchQuery`.

---

### [Data: 2026-02-22] — Utilitarios de Data/Hora Localizados (utils.ts)

Motivo da Criacao:

- Multiplos componentes implementavam formatacao de datas de forma independente e
  inconsistente (algumas em UTC, outras com `toLocaleDateString` inline). Centralizar
  em `utils.ts` garante comportamento uniforme no fuso horario do browser do usuario.

Escopo:

- Front-end: `src/lib/utils.ts`, `src/pages/AdminDatabaseMonitor.tsx`,
  `src/components/therapist/PatientDetail.tsx`.

Impacto:

- `formatLocalDate(iso)` — converte ISO UTC para data local em pt-BR ("DD/MM/AAAA").
- `formatLocalDateTime(iso)` — converte ISO UTC para data+hora local em pt-BR.
- `timeAgoLocal(iso)` — tempo relativo para eventos recentes; data/hora completa
  para eventos com mais de 24h. Substitui `timeAgo()` que estava inline em
  `AdminDatabaseMonitor.tsx` (retornava apenas "Nd atras" sem data real).
- `PatientDetail.tsx` usa `formatLocalDateTime` para exibir a data de inicio do paciente.

Riscos:

- Formatacao dependente do locale do sistema operacional do usuario; pode variar
  em ambientes sem suporte a pt-BR (raro em browsers modernos).

Migracao:

- Sem migracao. Funcoes exportadas; componentes que usavam logica inline devem
  importar de `@/lib/utils`.

Testes:

- `formatLocalDate("2026-02-22T03:00:00Z")` → retorna data no fuso local do browser.
- `timeAgoLocal` com ISO de 5 min atras → "5m atras".
- `timeAgoLocal` com ISO de 2 dias atras → data/hora formatada (nao "48h atras").

Referencias:

- `front-end/src/lib/utils.ts`.
