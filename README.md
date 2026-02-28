<div align="center">

# ✝️ Vida com Deus

**Plataforma full-stack de conteudo cristao com inteligencia artificial 🚀**

Do primeiro deploy em Netlify ate um chat biblico com IA — esse projeto acompanha minha evolucao como desenvolvedor. A [v1](https://github.com/enascentedev/vida-com-deus) me consagrou como junior (Node.js + Vue.js, 114+ commits, [deploy online](https://tempoderefletir.netlify.app/login)). A v2 e o salto para pleno: React 19, FastAPI, PostgreSQL no Supabase, OpenAI e um workflow inteiro assistido por IA com Claude Code e Cursor.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Claude Code](https://img.shields.io/badge/Claude_Code-Anthropic-D97706?style=for-the-badge&logo=anthropic&logoColor=white)](https://claude.ai/)
[![Cursor](https://img.shields.io/badge/Cursor-IDE-000000?style=for-the-badge&logo=cursor&logoColor=white)](https://cursor.com/)

</div>

---

## 📖 Sobre o Projeto

**Vida com Deus** e uma plataforma devocional que entrega conteudo biblico diario com apoio de inteligencia artificial. 💡 Os usuarios acessam o post do dia, interagem com um chat biblico contextualizado e mantem uma biblioteca pessoal de favoritos e historico de leituras.

Esse projeto nasceu la atras como um desafio pessoal — e foi crescendo junto comigo. A [v1](https://github.com/enascentedev/vida-com-deus) foi construida com Node.js, Express, Vue.js 3, Tailwind CSS e PostgreSQL. Teve deploy no Netlify e Render, 114+ commits de dedicacao diaria e ate uma [postagem no LinkedIn](https://www.linkedin.com/posts/emanuel-nascente-3b36b122a_visaetogeral-conteaeqdoinspirador-conquistas-activity-7208627367429255168-PpuP) com 211 reacoes e 32 comentarios da comunidade. 🎉

A v2 e a evolucao natural: uma reescrita completa com stack mais robusta, arquitetura profissional e inteligencia artificial integrada ao produto e ao proprio processo de desenvolvimento.

> 💬 *Projeto em desenvolvimento ativo — cada commit e um passo a mais na jornada.*

---

## 🔄 Da v1 para a v2 — a evolucao

> A [v1](https://github.com/enascentedev/vida-com-deus) era um projeto full-stack completo: Node.js + Express no back-end, Vue.js 3 + Tailwind no front-end, PostgreSQL com driver `pg`, autenticacao JWT com cookies, Docker para build/deploy, testes com Playwright e deploy real no Netlify + Render. Foi o projeto que me formou como desenvolvedor junior — e eu tenho orgulho de cada um dos 114+ commits. 💪
>
> Mas eu queria mais. Queria dominar uma nova stack, integrar IA, construir um design system do zero e aplicar arquitetura de software profissional. A v2 e essa ambicao virando codigo.

| v1 🏗️ | v2 🚀 | Por que mudou? |
| --- | --- | --- |
| **Node.js + Express** | **FastAPI (Python)** | Tipagem nativa com Pydantic, async de verdade, docs automaticas com Swagger |
| **Vue.js 3** | **React 19 + TypeScript** | Ecossistema maior, React 19 com renderizacao concorrente, tipagem estrita end-to-end |
| **JavaScript** | **TypeScript** | Bugs pegos em compilacao, IntelliSense completo, APIs de componentes type-safe |
| **PostgreSQL (driver `pg`)** | **PostgreSQL via Supabase + SQLAlchemy + Alembic** | ORM profissional, migracoes versionadas, infraestrutura gerenciada |
| **Tailwind CSS v3** | **Tailwind CSS v4** | Configuracao CSS-first com `@theme`, builds mais rapidos |
| **Componentes soltos** | **`vida-com-deus-ui` (design system)** | Biblioteca propria com build dual CJS/ESM via tsup |
| **Sem IA** | **OpenAI + Claude Code + Cursor** | IA no produto (chat) e no processo de desenvolvimento |
| **Netlify + Render** | **Supabase (BaaS)** | Banco, auth, storage e realtime num so lugar |

Isso nao foi um recomeco — foi uma **evolucao deliberada**. Cada decisao da v2 veio de uma limitacao real que eu senti na v1. 🎯

---

## ✨ Funcionalidades

- 🌓 **Dark / Light mode** — Temas via variaveis CSS com alternancia fluida pela classe `.dark`
- ♿ **Acessivel por padrao** — Primitivos Radix UI (WAI-ARIA), HTML semantico, navegacao por teclado
- 📱 **Design responsivo** — Mobile-first com Tailwind CSS v4
- 🔐 **Autenticacao completa** — Cadastro, login, recuperacao de senha e refresh token JWT
- 🏠 **Feed do dia** — Hero card, posts recentes e skeleton loader
- 📖 **Post Detail** — Player de audio, tabs de conteudo (IA, Tags, Devocional)
- 💬 **Chat Biblico com IA** — Mensagens com citacoes expansiveis e sugestoes de perguntas
- 📚 **Biblioteca** — Favoritos e historico com busca e filtros
- ⚙️ **Configuracoes** — Perfil do usuario, seletor de tema, toggles de IA e notificacoes
- 🖥️ **Admin Monitor** — Painel de monitoramento com metricas, ETL e alertas

### 🤖 Chat Biblico com IA — GPT-4o-mini

O chat usa o modelo **GPT-4o-mini** da OpenAI. A escolha foi por **eficiencia de custo** — eu pago a chave da API do meu bolso! 💰 Para liberar o projeto para testes sem estourar o orcamento, um modelo mais acessivel faz mais sentido. Mas isso e **perfeitamente ajustavel**: trocar para GPT-4o, GPT-4-turbo ou qualquer modelo mais recente e questao de uma unica variavel de ambiente.

### 🕷️ ETL de Scraping — a cereja do bolo 🍒

O scraper e uma das partes que mais me orgulho nesse projeto. Ele coleta automaticamente conteudo cristao do site wgospel.com/tempoderefletir, processa e armazena os posts no banco com tags e categorizacao.

**Hoje ele ja faz:**
- Coleta automatizada de artigos e reflexoes
- Processamento e limpeza do conteudo
- Persistencia estruturada com metadados
- Historico de execucoes (ultimas 20 runs) para auditoria

**O que vem por ai:** 🔮 Tenho grandes planos de melhoria — adicionar mais fontes de conteudo, agendamento com filas assincronas, geracao de embeddings para busca semantica e integracao com o chat biblico para respostas fundamentadas em conteudo real.

### 🗄️ PostgreSQL + Supabase — mais que um banco de dados

A escolha pelo [Supabase](https://supabase.com/) nao foi so pelo PostgreSQL gerenciado. O Supabase traz um ecossistema completo:

- ✅ **PostgreSQL hospedado** — Banco relacional robusto sem infra pra gerenciar
- ✅ **SQLAlchemy + Alembic** — ORM profissional com migracoes versionadas
- 🔜 **Auth nativo** — Sistema de autenticacao pronto (futuro)
- 🔜 **Realtime** — Subscriptions em tempo real via WebSocket (futuro)
- 🔜 **Storage** — Armazenamento de arquivos integrado (futuro)
- 🔜 **Edge Functions** — Logica serverless na borda (futuro)

> Nem todas as vantagens foram exploradas ainda — e esse e o ponto. O Supabase foi escolhido pensando no longo prazo, e cada feature nova vai desbloquear uma capacidade que ja esta la esperando. 🚀

---

## 🏗️ Estrutura do Projeto

```text
vida-com-deus-IA/
│
├── front-end/                        # ⚛️ Aplicacao React 19 + Vite + Tailwind v4
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/                 # LoginForm
│   │   │   └── layout/               # BottomNavigation, SecondaryTopbar
│   │   ├── pages/                    # 10 paginas implementadas
│   │   └── lib/utils.ts              # cn() (clsx + tailwind-merge)
│   ├── vida-com-deus-ui/             # 📦 Biblioteca local de componentes (tsup)
│   │   └── src/components/ui/        # Button, Card, Input, Badge, Skeleton, Separator
│   ├── .claude/                      # 🔒 No .gitignore (prompt engineering)
│   │   ├── agents/design-implementer.md
│   │   └── skills/react-ui-patterns/
│   ├── .cursor/                      # 🔒 No .gitignore (prompt engineering)
│   │   ├── index.mdc
│   │   └── agents/createLayout.mdc
│   ├── docs/
│   │   ├── designer/                 # 18 designs de referencia (PNG + HTML)
│   │   ├── etapas.md
│   │   └── registro-features.md
│   ├── screenshots/                  # Capturas automaticas por rota (Playwright)
│   └── scripts/screenshot-routes.py
│
└── back-end/                         # 🐍 API FastAPI (Python 3.13)
    ├── app/
    │   ├── main.py                   # FastAPI app — CORS, routers, health check
    │   ├── api/
    │   │   ├── router.py             # Agrega todos os routers sob /v1
    │   │   └── v1/                   # auth, users, posts, library, chat, admin
    │   ├── core/                     # config, security (JWT), dependencies, scraper
    │   ├── domain/                   # Schemas Pydantic por dominio
    │   ├── services/                 # Logica de negocio
    │   ├── repositories/             # Acesso a dados — PostgreSQL
    │   ├── workers/                  # Tarefas assincronas — e-mail, ETL
    │   └── integrations/             # Provedores externos — IA, storage
    └── tests/
        └── contract/                 # 40+ testes de contrato
```

---

## 🛠️ Tech Stack

### Front-end

| Camada | Tecnologia |
| --- | --- |
| Framework | React 19 + TypeScript 5.9 |
| Build Tool | Vite 7 |
| Roteamento | React Router DOM v7 |
| Estilizacao | Tailwind CSS v4 + PostCSS |
| Primitivos UI | Radix UI + shadcn/ui |
| Icones | Lucide React |
| Biblioteca UI local | vida-com-deus-ui (tsup — ESM + CJS + .d.ts) |
| Linting | ESLint 9 (flat config) |

### Back-end

| Camada | Tecnologia |
| --- | --- |
| Framework | FastAPI 0.115 + Python 3.13 |
| Banco de Dados | PostgreSQL via Supabase |
| ORM | SQLAlchemy |
| Migracoes | Alembic |
| Validacao | Pydantic v2 |
| Inteligencia Artificial | OpenAI GPT-4o-mini (ajustavel) |
| Autenticacao | JWT (HS256) — access + refresh tokens |
| Gerenciador de Pacotes | uv |
| Testes | pytest + pytest-asyncio |

### Ferramentas de Desenvolvimento com IA 🤖

| Ferramenta | Uso |
| --- | --- |
| Claude Code (Anthropic) | Arquitetura, implementacao, refatoracao e testes |
| Cursor IDE | Prototipacao de layout com regras e agentes customizados |
| CLAUDE.md | Contexto de projeto — "memoria permanente" para o agente |

---

## 🔌 Arquitetura Backend

O backend e uma API FastAPI modular orientada a dominios com camadas bem definidas:

```text
Requisicao HTTP
    → api/v1/<dominio>.py        (rota + validacao)
    → services/<dominio>.py      (logica de negocio)
    → repositories/<dominio>.py  (acesso a dados)
    → models/<dominio>.py        (SQLAlchemy)
    → PostgreSQL (Supabase)
```

**Endpoints disponiveis em `/v1`:**

| Dominio | Prefixo |
| --- | --- |
| Auth | `/auth/{signup,login,refresh,logout,forgot-password,reset-password}` |
| Usuario | `/users/me`, `/users/me/settings` |
| Posts | `/posts/feed`, `/posts/{id}`, `/posts/{id}/audio` |
| Biblioteca | `/library/`, `/library/favorites/{id}` |
| Chat | `/chat/conversations`, `/chat/conversations/{id}/messages` |
| Admin | `/admin/metrics/storage`, `/admin/alerts`, `/admin/etl/runs/execute` |
| Health | `GET /health` (fora do prefixo `/v1`) |

---

## 🚀 Instalacao

### Pre-requisitos

- Node.js 20+
- Python 3.13
- [uv](https://docs.astral.sh/uv/) — `pip install uv`

### Frontend

```bash
cd front-end

# Buildar a biblioteca UI primeiro
cd vida-com-deus-ui && npm install && npm run build && cd ..

# Instalar dependencias do app principal e iniciar
npm install
npm run dev
```

### Backend

```bash
cd back-end

# Instalar dependencias (cria .venv automaticamente)
uv sync

# Configurar variaveis de ambiente
cp .env.example .env
# Editar .env com suas chaves (JWT_SECRET_KEY, DATABASE_URL, OPENAI_API_KEY)

# Executar migracoes do banco
uv run alembic upgrade head

# Iniciar servidor (uv run ativa o .venv automaticamente)
uv run uvicorn app.main:app --reload
```

API disponivel em `http://localhost:8000` · Swagger UI em `http://localhost:8000/docs`.

---

## 🧪 Testes

```bash
# A partir de back-end/
pytest                   # Todos os testes
pytest tests/contract    # Testes de contrato da API
pytest --cov             # Com relatorio de cobertura
```

---

## 🧠 Desenvolvido com IA — e por que voce nao vai encontrar os prompts aqui

Esse projeto nao e apenas **sobre** IA — ele e **construido com** IA. O Claude Code e o Cursor fazem parte do meu workflow diario de desenvolvimento, e a forma como eu uso essas ferramentas e resultado de **anos de estudo em engenharia de prompt**.

### Por que `.claude/`, `.cursor/` e `CLAUDE.md` estao no `.gitignore`? 🔒

Esses arquivos contem prompts, regras de contexto, agentes customizados e skills refinadas ao longo de **anos de estudo e milhares de tokens gastos** testando, iterando e melhorando instrucoes dia a dia. Cada regra, cada convencao, cada instrucao ali dentro foi calibrada na pratica — nao e algo que se escreve uma vez e esquece. E um processo vivo, assim como o proprio codigo.

**Engenharia de prompt bem feita e propriedade intelectual.** Assim como um chef nao entrega sua receita secreta, esses arquivos representam um diferencial construido com tempo, dedicacao e muito cafe. ☕

### Como funciona o workflow na pratica? 🔧

O desenvolvimento passou por duas fases distintas:

**Fase 1 — Prototipacao com Cursor AI**

O arquivo `.cursor/index.mdc` contem o **prompt mestre** que guiou o Cursor na criacao da estrutura inicial: stack, estilo visual, tokens de cor (light/dark mode), estrutura de componentes e tarefas ordenadas. Tambem foi criado um agente `.cursor/agents/createLayout.mdc` com instrucoes aplicadas automaticamente a toda sessao de layout.

**Fase 2 — Implementacao com Claude Code**

Apos a prototipacao, o projeto migrou para o **Claude Code** (CLI oficial da Anthropic) como ambiente principal. Tres artefatos garantem qualidade e consistencia:

- **`CLAUDE.md`** — Lido automaticamente em toda sessao. Define comandos, arquitetura, rotas, padroes visuais e convencoes — funciona como "memoria permanente" do projeto
- **`.claude/agents/design-implementer.md`** — Agente especializado em converter designs em componentes React, com **3 fases obrigatorias** (revisao do design → implementacao → revisao do codigo). O modelo nao pode pular etapas
- **`.claude/skills/react-ui-patterns/SKILL.md`** — Skill com tokens de cor, regras de espacamento, esqueleto padrao de pagina e checklist de qualidade. Funciona como guia de estilo em tempo de execucao

**Captura automatica de telas** — Script Playwright (`scripts/screenshot-routes.py`) que fotografa **todas as 10 rotas** em desktop (1280×800) e mobile iPhone 11 (390×844) para validacao visual.

**Resultado:** 18 telas de design convertidas em 10 paginas React TypeScript, com build limpo (0 erros) e padroes visuais consistentes. ✅

> O diferencial e o **processo projetado**: agente com fases obrigatorias + skill com tokens do design system + checklist de revisao = resultados consistentes e revisaveis, nao apenas geracao de codigo.

> 💬 **Quer conversar sobre desenvolvimento de software com Claude Code e Cursor?**
>
> Estou totalmente aberto a trocar experiencias, mostrar o workflow e discutir boas praticas. Me chama no privado do [LinkedIn](https://www.linkedin.com/in/emanuel-nascente-3b36b122a/) — vai ser um prazer conversar! 🤝

---

## 📚 Minha jornada — do junior ao pleno

Mais do que linhas de codigo, esse projeto conta a historia da minha evolucao como desenvolvedor. Cada versao marca um capitulo diferente. 📖

### 🏗️ v1 — onde tudo comecou (a consagracao como dev junior)

A [v1](https://github.com/enascentedev/vida-com-deus) foi o projeto que me formou. Foi ali que eu aprendi o que significa ser um desenvolvedor full-stack de verdade:

- **Node.js + Express** — minha primeira API do zero, com rotas, middlewares, tratamento de erros customizado e CORS
- **Vue.js 3 + Tailwind CSS** — componentes reativos, Vue Router com protecao de rotas, Pinia para estado global, Axios com interceptores
- **PostgreSQL** — banco relacional com driver `pg` e scripts SQL de migracao
- **JWT + Cookies** — autenticacao completa com persistencia de sessao
- **Docker** — containerizacao para builds e deploy dinamico
- **Deploy real** — front-end no Netlify, back-end no Render. Projeto rodando online com usuarios reais
- **Playwright** — primeiros testes end-to-end no front-end
- **114+ commits** de dedicacao diaria e consistente 💪

A v1 me ensinou que software nao e so codigo — e deploy, e usuario testando, e bug em producao, e a disciplina de commitar todo dia. Foi esse projeto que me deu confianca pra dizer: *"eu sou desenvolvedor"*. 🎓

### 🚀 v2 — a marca de um dev pleno

A v2 e onde eu mostro que nao estou parado. Cada decisao aqui reflete um nivel de maturidade diferente:

- **TypeScript de ponta a ponta** — nao e so "adicionar tipos". E projetar APIs de componentes com generics, discriminated unions e `forwardRef` tipado
- **React 19 do zero** — vindo do Vue, aprendi a tomar todas as decisoes que o Vue resolve sozinho. Gerenciamento de estado, composicao, performance — tudo na mao
- **FastAPI com arquitetura em camadas** — saindo do Express flat para um monolito modular com services, repositories, models e schemas Pydantic. Entendi na pratica por que cada camada existe
- **Design system proprio** — `vida-com-deus-ui` me ensinou como design systems funcionam de verdade: barrel exports, build dual CJS/ESM, peer dependencies e padroes do shadcn/ui
- **Integracao com IA** — implementar um chat com a OpenAI, gerenciar contexto de conversa, lidar com fallbacks e custos de API
- **PostgreSQL profissional** — de queries raw com `pg` para SQLAlchemy ORM + Alembic migrations + Supabase como infraestrutura
- **Tailwind CSS v4** — migracao early-adopter, aprendendo a configuracao CSS-first antes de virar mainstream
- **ETL de scraping** — criar um pipeline de coleta automatizada de conteudo, com processamento, persistencia e auditoria
- **Engenharia de prompt** — descobri que instruir agentes de IA e uma habilidade tecnica tao importante quanto escrever codigo. O `CLAUDE.md` e as regras do `.cursor/` sao resultado de anos de estudo e milhares de tokens de experimentacao
- **Acessibilidade como fundacao** — Radix UI + WAI-ARIA desde o primeiro componente, nao como retrofit

> A v1 provou que eu consigo entregar. A v2 prova que eu consigo **pensar, projetar e evoluir**. 🎯

---

<div align="center">

Construido com ☕ e fe.

**[Vida com Deus](https://github.com/enascentedev/vida-com-deus-IA)** — onde tecnologia encontra proposito. ✝️

💬 Quer conversar sobre desenvolvimento com IA, Claude Code ou Cursor?
Me chama no [LinkedIn](https://www.linkedin.com/in/emanuel-nascente-3b36b122a/) — vai ser um prazer trocar ideia! 🤝

</div>
