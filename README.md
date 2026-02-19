<div align="center">

# ✝️ Vida com Deus — Frontend v2

**De Vue.js para React + TypeScript: uma reescrita completa do frontend pensada para escala, acessibilidade e Interface moderna.**

Este projeto comecou como uma aplicacao Vue.js. A v2 e uma reconstrucao do zero usando React 19, TypeScript, Tailwind CSS v4 e uma biblioteca de componentes propria — provando que trocar de framework nao é recomeco, é evolucao.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-components-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![Accessibility](https://img.shields.io/badge/a11y-WCAG_2.1-green?style=for-the-badge&logo=accessibility&logoColor=white)](https://www.w3.org/WAI/WCAG21/quickref/)

</div>

---

## 🔄 Por que a v2?

> A v1 foi construida com Vue.js. Funcionava — mas conforme o projeto crescia, eu precisava de uma stack que acompanhasse a direcao que eu estava tomando profissional e arquiteturalmente.

| Decisao                     | Motivo                                                                                                                                                                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vue → React**             | Ecossistema maior, melhor alinhamento com o mercado de trabalho e as novidades do React 19 (compiler-ready, renderizacao concorrente)                                                                                                     |
| **JavaScript → TypeScript** | Tipagem estrita que pega bugs em tempo de compilacao, nao em producao                                                                                                                                                                     |
| **Tailwind v3 → v4**        | Configuracao CSS-first com `@theme`, deteccao automatica de conteudo, builds mais rapidos                                                                                                                                                 |
| **Biblioteca UI propria**   | `vida-com-deus-ui` — abstrair a verbosidade dos componentes, centralizar estilos do projeto e aprender a publicar uma biblioteca no npm pela primeira vez (inspirada na [`facta-ui-react`](https://www.npmjs.com/package/facta-ui-react)) |
| **Vite 7**                  | HMR instantaneo, ESM nativo e builds ultrarapidos                                                                                                                                                                                         |

Isso nao foi apenas uma reescrita — foi uma migracao deliberada para dominar um novo ecossistema do zero.

---

## ✨ Funcionalidades

- 🌓 **Dark / Light mode** — Temas via variaveis CSS com alternancia fluida pela classe `.dark`
- ♿ **Acessivel por padrao** — Construido sobre primitivos Radix UI (compativel com WAI-ARIA), HTML semantico, navegacao por teclado e gerenciamento de foco
- 📱 **Design responsivo** — Abordagem mobile-first com classes utilitarias do Tailwind
- 🎨 **Design system** — Biblioteca de componentes `vida-com-deus-ui` com variantes CVA e composicao de classes via `cn()`
- 🔐 **Fluxo de autenticacao** — Login, Cadastro e Recuperacao de senha com login social (Google e Apple)
- 🌐 **Navegacao client-side** — React Router com 10 rotas declaradas em `App.tsx`
- 🏠 **Home** — Feed do dia com hero card, posts recentes, skeleton loader e CTA de chat
- 📖 **Post Detail** — Leitura de post com player de audio, tabs de conteudo (IA, Tags, Devocional) e FAB de chat
- 💬 **Chat Biblico com IA** — Interface de mensagens com citacoes biblicas expansiveis e sugestoes de perguntas
- 📚 **Biblioteca** — Favoritos e historico com busca, filtros e estado vazio
- ⚙️ **Configuracoes** — Perfil do usuario, seletor de tema e toggles de IA e notificacoes
- 🖥️ **Admin Monitor** — Painel de monitoramento do banco de dados com grafico, ETL e alertas
- 🧩 **Componentes polimorficos** — Padrao `asChild` via Radix Slot para renderizacao flexivel
- ⚡ **Props type-safe** — Todos os componentes estendem atributos nativos de elementos HTML com IntelliSense completo

---

## 🛠️ Tech Stack

<table>
<tr><td><strong>Categoria</strong></td><td><strong>Tecnologia</strong></td></tr>
<tr><td>Framework</td><td>React 19 + TypeScript 5.9</td></tr>
<tr><td>Build Tool</td><td>Vite 7</td></tr>
<tr><td>Roteamento</td><td>React Router DOM v7</td></tr>
<tr><td>Estilizacao</td><td>Tailwind CSS v4 + PostCSS</td></tr>
<tr><td>Primitivos UI</td><td>Radix UI + shadcn/ui</td></tr>
<tr><td>Variantes de Componentes</td><td>Class Variance Authority (CVA)</td></tr>
<tr><td>Icones</td><td>Lucide React</td></tr>
<tr><td>Utilitarios de Classes</td><td>clsx + tailwind-merge</td></tr>
<tr><td>Build da Biblioteca UI</td><td>tsup (ESM + CJS + .d.ts)</td></tr>
<tr><td>Linting</td><td>ESLint 9 (flat config) + regras TypeScript</td></tr>
</table>

---

## 🏗️ Decisoes de Arquitetura

### Monorepo de dois pacotes

```text
vida-com-deus-IA/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginForm.tsx           # ✅ Implementado
│   │   └── layout/                     # ✅ Implementado
│   │       ├── BottomNavigation.tsx    #    Nav inferior (Home/Chat/Biblioteca/Admin)
│   │       └── SecondaryTopbar.tsx     #    Topbar com botao voltar
│   ├── hooks/                          # 🔜 Planejado
│   ├── lib/
│   │   └── utils.ts                    # Utilitario cn()
│   ├── pages/
│   │   ├── LandingPage.tsx             # ✅ Implementado — pagina publica de marketing
│   │   ├── Login.tsx                   # ✅ Implementado — autenticacao
│   │   ├── SignUp.tsx                  # ✅ Implementado — cadastro
│   │   ├── PasswordRecovery.tsx        # ✅ Implementado — recuperacao de senha
│   │   ├── Home.tsx                    # ✅ Implementado — feed do dia
│   │   ├── PostDetail.tsx              # ✅ Implementado — leitura com player e tabs
│   │   ├── BiblicalAIChat.tsx          # ✅ Implementado — chat biblico com IA
│   │   ├── Favorites.tsx               # ✅ Implementado — biblioteca/favoritos
│   │   ├── AccountSettings.tsx         # ✅ Implementado — configuracoes do usuario
│   │   └── AdminDatabaseMonitor.tsx    # ✅ Implementado — painel admin
│   ├── App.tsx                         # BrowserRouter + Routes (10 rotas)
│   ├── App.css
│   ├── index.css                       # Variaveis de tema Tailwind v4
│   └── main.tsx                        # Entry point React 19
│
├── vida-com-deus-ui/                   # Biblioteca local de componentes UI
│   └── src/
│       ├── components/
│       │   └── ui/                     # Todos os componentes base
│       │       ├── badge.tsx
│       │       ├── button.tsx
│       │       ├── card.tsx
│       │       ├── input.tsx
│       │       ├── separator.tsx
│       │       └── skeleton.tsx
│       ├── lib/
│       │   └── utils.ts                # Utilitario cn() compartilhado
│       └── index.ts                    # Barrel exports
│
├── docs/
│   ├── designer/                       # Designs de referencia (18 telas)
│   │   ├── home_-_post_do_dia_1/      #   screen.png + code.html por tela
│   │   └── ...
│   ├── etapas.md                       # Historico de etapas concluidas
│   └── registro-features.md           # Registro formal de features
│
├── index.html                          # Entry point HTML
├── vite.config.ts                      # Configuracao Vite + alias @/*
├── postcss.config.js                   # Plugin @tailwindcss/postcss
├── tsconfig.json                       # TypeScript raiz
├── tsconfig.app.json                   # TypeScript app (strict)
├── tsconfig.node.json                  # TypeScript node
├── eslint.config.js                    # ESLint 9 flat config
└── package.json
```

### Por que uma biblioteca UI separada?

O pacote `vida-com-deus-ui` e linkado localmente via `file:` durante o desenvolvimento, com o objetivo de ser publicado no npm. Inspirada na [`facta-ui-react`](https://www.npmjs.com/package/facta-ui-react), a biblioteca existe para:

- **Abstrair a verbosidade** — componentes prontos com variantes pre-configuradas, sem repetir props e classes em cada uso
- **Centralizar estilos** — um unico lugar para tokens de design, temas e padroes visuais do projeto
- **Aprender na pratica** — primeira experiencia publicando uma biblioteca no npm, com build dual CJS/ESM via tsup e tipagens geradas automaticamente

### Arquitetura de temas

Todas as cores sao definidas como custom properties CSS em HSL, com escopo em `:root` (light) e `.dark` (dark):

```css
/* Light */
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--primary: 221.2 83.2% 53.3%;

/* Dark */
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;
--primary: 217.2 91.2% 59.8%;
```

Os componentes consomem essas variaveis via classes do Tailwind como `bg-background`, `text-foreground`, etc. — permitindo trocar de tema com um unico toggle de classe.

---

## 🤖 Desenvolvimento Assistido por IA (Claude Code)

Uma parte relevante deste projeto foi desenvolvida com o auxilio do **Claude Code** — a CLI oficial da Anthropic para desenvolvimento assistido por IA. Mais do que usar IA para gerar codigo, o objetivo foi **projetar o processo** para obter resultados consistentes, revistaveis e alinhados ao design system.

### O Agente `design-implementer`

Para converter os 18 designs (HTML + PNG em `docs/designer/`) em componentes React, criei um **agente customizado** em `.claude/agents/design-implementer.md`. O agente define um contrato de trabalho com **3 fases obrigatorias** — o modelo nao pode pular etapas:

```text
Fase 1 — Revisao do Design
  1.1 Inventario de elementos (textos, icones, botoes, cards, inputs...)
  1.2 Hierarquia visual (o que o olho ve primeiro, segundo, terceiro)
  1.3 Estados e interacoes visiveis (hover, ativo, loading, vazio)
  1.4 Mapeamento de componentes (qual componente da lib usar, qual pasta)
  1.5 Ambiguidades e como resolve-las

Fase 2 — Implementacao
  - Verificar existencia de componentes na lib antes de assumir
  - Criar na lib se necessario, exportar no barrel, rebuildar
  - Implementar seguindo os padroes da skill react-ui-patterns
  - npm run build deve passar sem erros antes de continuar

Fase 3 — Revisao do Codigo
  - Checklist de fidelidade ao design
  - Checklist de padroes do projeto
  - Checklist de qualidade de codigo (aria-label, tipagem, sem any)
```

### A Skill `react-ui-patterns`

Alem do agente, criei uma **skill reutilizavel** em `.claude/skills/react-ui-patterns/SKILL.md` que injeta contexto tecnico especifico do projeto em cada chamada:

- **Tokens de cor obrigatorios** — `bg-slate-50`, `blue-600`, `text-slate-800`, etc.
- **Espacamentos e bordas** — `px-5` lateral, `rounded-2xl` em cards, `shadow-sm`
- **Esqueleto de pagina padrao** — `Topbar + main + BottomNavigation`
- **Regras de import** — nunca de `@/components/ui/`, sempre de `vida-com-deus-ui`
- **Padroes de sub-componentes** — cada secao visual distinta = funcao separada no arquivo

Essa skill e referenciada no front matter do agente (`skills: react-ui-patterns`) e carregada automaticamente em cada sessao de implementacao.

### Engenharia de Prompt — Decisoes Tecnicas

Algumas escolhas intencionais no design do agente:

| Decisao                                   | Motivo                                                                                                           |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Fase de inventario obrigatoria**        | Evita que o modelo comece a codar antes de entender o design completo, reduzindo retrabalho                      |
| **Checklist de revisao com `[ ]`**        | Formato markdown que o modelo processa como itens verificaveis, nao como texto livre                             |
| **Skill separada do agente**              | Permite reutilizar os tokens visuais em outros agentes futuros sem duplicacao                                    |
| **`npm run build` obrigatorio na Fase 2** | Garante zero erros TypeScript antes de continuar — o modelo nao pode entregar com build quebrado                 |
| **Fase de ambiguidades (1.5)**            | Forca o modelo a documentar cada decisao subjetiva (ex: qual icone do lucide-react substitui um Material Symbol) |

### Resultado Pratico

Com esse workflow, **18 telas de design foram convertidas em 10 paginas React TypeScript em uma unica sessao**, com:

- Build limpo (`0 erros TypeScript`, bundle de 330 kB)
- Todos os componentes base vindos de `vida-com-deus-ui`
- Navegacao funcional entre todas as rotas via React Router
- Padroes visuais consistentes em todas as telas (cores, espacamentos, bordas)
- Estados interativos implementados (tabs, toggles, busca, estado vazio, loading)

> O diferencial nao e so usar IA — e **projetar o processo** para que a IA produza resultados previsíveis, revisaveis e alinhados ao design system. Isso e o que separa "gerar codigo com IA" de "engenharia assistida por IA".

<!-- ---

## 📸 Screenshots

<div align="center">

| Modo Light                                       | Modo Dark                                      |
| ------------------------------------------------ | ---------------------------------------------- |
| ![Login Light](docs/screenshots/login-light.png) | ![Login Dark](docs/screenshots/login-dark.png) |

_Screenshots em breve — o app esta em desenvolvimento ativo._

</div>

--- -->

## 🚀 Instalacao

```bash
# Clonar o repositorio
git clone https://github.com/your-username/vida-com-deus-IA.git
cd vida-com-deus-IA

# Instalar dependencias
npm install

# Buildar a biblioteca UI primeiro
cd vida-com-deus-ui && npm install && npm run build && cd ..

# Iniciar o servidor de desenvolvimento
npm run dev
```

### Scripts disponiveis

| Comando           | Descricao                                |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Inicia o servidor Vite com HMR           |
| `npm run build`   | Checagem TypeScript + build de producao  |
| `npm run lint`    | Executa o ESLint                         |
| `npm run preview` | Visualiza o build de producao localmente |

---

## 📚 O que eu aprendi

Essa migracao foi uma das experiencias de aprendizado mais valiosas da minha jornada frontend. Aqui esta o que eu tirei dela:

### Ecossistema React do zero

Vindo da estrutura opinativa do Vue, aprendi a tomar decisoes arquiteturais que o Vue resolve por padrao — padroes de gerenciamento de estado, composicao de componentes e encaminhamento de refs.

### TypeScript na pratica

Nao apenas adicionar tipos, mas projetar APIs de componentes com `React.forwardRef`, props genericas estendendo `HTMLAttributes` e discriminated unions para variantes de props.

### Construindo uma biblioteca de componentes

Criar a `vida-com-deus-ui` me ensinou como design systems funcionam por baixo dos panos — barrel exports, builds duais CJS/ESM com tsup, peer dependencies e os padroes de componentes do shadcn/ui.

### Migracao do Tailwind CSS v4

Migrei do v3 → v4 cedo, aprendendo a nova configuracao CSS-first com `@theme`, a arquitetura do plugin `@tailwindcss/postcss` e o sistema de variaveis de tema.

### Desenvolvimento acessivel desde o inicio

Usar primitivos do Radix UI significa que cada componente interativo ja vem com atributos ARIA corretos, navegacao por teclado e gerenciamento de foco — nao como um adicional, mas como fundacao.

<!-- ---

## 📋 Roadmap

- [x] Setup do projeto (React 19 + TypeScript + Vite 7)
- [x] Tela de login com componentes shadcn/ui
- [x] Biblioteca UI local (`vida-com-deus-ui`)
- [x] Migracao para Tailwind CSS v4
- [x] Roteamento client-side com React Router DOM v7
- [x] Componentes de layout compartilhados (BottomNavigation, SecondaryTopbar)
- [x] Implementacao de todos os layouts de tela (10 paginas)
- [ ] Fluxo de autenticacao real (integracao com backend)
- [ ] Integracao com API de posts e feed dinamico
- [ ] Chat biblico com IA (integracao com backend RAG)
- [ ] Toggle de dark mode funcional na UI
- [ ] Publicar `vida-com-deus-ui` no npm

--- -->

<div align="center">

Construido com ☕ e fe.

**[Vida com Deus](https://github.com/your-username/vida-com-deus-IA)** — onde tecnologia encontra proposito.

</div>
