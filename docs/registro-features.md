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
