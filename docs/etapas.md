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

## Documentacao
1. [Registro de Features](./registro-features.md)
