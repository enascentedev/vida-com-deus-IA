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
