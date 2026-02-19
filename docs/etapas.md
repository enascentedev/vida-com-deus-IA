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

## Documentacao

1. [Registro de Features](./registro-features.md)
