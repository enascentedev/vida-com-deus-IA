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

## Documentacao

1. [Registro de Features](./registro-features.md)
