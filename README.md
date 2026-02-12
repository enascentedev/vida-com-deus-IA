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
- 🔐 **UI de Login** — Tela de autenticacao completa com email/senha, login social (Google e Apple) e toggle de visibilidade de senha
- 🧩 **Componentes polimorficos** — Padrao `asChild` via Radix Slot para renderizacao flexivel
- ⚡ **Props type-safe** — Todos os componentes estendem atributos nativos de elementos HTML com IntelliSense completo

---

## 🛠️ Tech Stack

<table>
<tr><td><strong>Categoria</strong></td><td><strong>Tecnologia</strong></td></tr>
<tr><td>Framework</td><td>React 19 + TypeScript 5.9</td></tr>
<tr><td>Build Tool</td><td>Vite 7</td></tr>
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
│   │   │   └── LoginForm.tsx        # ✅ Implementado
│   │   ├── ui/                      # Componentes base (de vida-com-deus-ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── separator.tsx
│   │   ├── admin/                   # 🔜 Planejado
│   │   ├── chat/                    # 🔜 Planejado
│   │   ├── layout/                  # 🔜 Planejado
│   │   └── post/                    # 🔜 Planejado
│   ├── hooks/                       # 🔜 Planejado
│   ├── lib/
│   │   └── utils.ts                 # Utilitario cn()
│   ├── pages/
│   │   └── Login.tsx                # ✅ Implementado
│   ├── App.tsx                      # Componente raiz
│   ├── App.css
│   ├── index.css                    # Variaveis de tema Tailwind v4
│   └── main.tsx                     # Entry point React 19
│
├── vida-com-deus-ui/                # Biblioteca local de componentes
│   └── src/
│       ├── components/
│       │   ├── auth/                # 🔜 Planejado
│       │   └── ui/                  # Button, Card, Input, Separator
│       │       ├── button.tsx
│       │       ├── card.tsx
│       │       ├── input.tsx
│       │       └── separator.tsx
│       ├── lib/
│       │   └── utils.ts             # Utilitario cn() compartilhado
│       └── index.ts                 # Barrel exports
│
├── docs/
│   ├── etapas.md                    # Etapas concluidas
│   └── registro-features.md        # Template de registro de features
│
├── index.html                       # Entry point HTML
├── vite.config.ts                   # Configuracao Vite + alias @/*
├── tailwind.config.js               # Configuracao Tailwind CSS
├── postcss.config.js                # Plugin @tailwindcss/postcss
├── tsconfig.json                    # TypeScript raiz
├── tsconfig.app.json                # TypeScript app (strict)
├── tsconfig.node.json               # TypeScript node
├── eslint.config.js                 # ESLint 9 flat config
├── components.json                  # Configuracao shadcn/ui
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
- [ ] Fluxo de autenticacao (integracao com backend)
- [ ] Componentes de layout (Sidebar, Topbar, MobileNav)
- [ ] Sistema de posts com painel de IA
- [ ] Chat com badges de citacao
- [ ] Dashboard administrativo
- [ ] Toggle de dark mode na UI
- [ ] Publicar `vida-com-deus-ui` no npm

--- -->

<div align="center">

Construido com ☕ e fe.

**[Vida com Deus](https://github.com/your-username/vida-com-deus-IA)** — onde tecnologia encontra proposito.

</div>
