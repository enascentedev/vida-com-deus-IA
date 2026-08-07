<div align="center">

# ✝️ Vida com Deus

**Plataforma full-stack de conteudo cristao com inteligencia artificial 🚀**

Do primeiro deploy em Netlify ate um chat biblico com IA — esse projeto acompanha minha evolucao como desenvolvedor. A [v1](https://github.com/enascentedev/vida-com-deus) me consagrou como junior (Node.js + Vue.js, 114+ commits, [deploy online](https://tempoderefletir.netlify.app/login)). A v2 e o salto para pleno: React 19, FastAPI, PostgreSQL, OpenAI e um workflow inteiro assistido por IA com Claude Code e Cursor.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
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
| **PostgreSQL (driver `pg`)** | **PostgreSQL via SQLAlchemy + Alembic** | ORM profissional, migracoes versionadas |
| **Tailwind CSS v3** | **Tailwind CSS v4** | Configuracao CSS-first com `@theme`, builds mais rapidos |
| **Componentes soltos** | **`vida-com-deus-ui` (design system)** | Biblioteca propria com build dual CJS/ESM via tsup |
| **Sem IA** | **OpenAI + Claude Code + Cursor** | IA no produto (chat) e no processo de desenvolvimento |

Isso nao foi um recomeco — foi uma **evolucao deliberada**. Cada decisao da v2 veio de uma limitacao real que eu senti na v1. 🎯

---

## ✨ Funcionalidades

- 🌓 **Dark / Light mode** — Temas via variaveis CSS com alternancia fluida pela classe `.dark`
- ♿ **Acessivel por padrao** — Primitivos Radix UI (WAI-ARIA), HTML semantico, navegacao por teclado
- 📱 **Design responsivo** — Mobile-first com Tailwind CSS v4
- 🔐 **Autenticacao completa** — Cadastro, login, recuperacao de senha e refresh token JWT
- 🏠 **Feed do dia** — Hero card, posts recentes e skeleton loader
- 📖 **Post Detail** — Player de áudio, tabs de conteúdo (IA, Tags, Devocional)
- 💬 **Chat Bíblico com IA** — Mensagens com citações expansíveis e sugestões de perguntas
- 📚 **Biblioteca** — Favoritos e histórico com busca e filtros
- ⚙️ **Configurações** — Perfil do usuário, seletor de tema, toggles de IA e notificações
- 🩺 **Dashboard do Terapeuta** — Gestão de pacientes, intake clínico, timeline de sessões, diretrizes de IA e controle de cota de mensagens
- 🖥️ **Admin Monitor** — Painel de monitoramento com métricas, ETL e alertas

### 🤖 Chat Bíblico com IA — GPT-4o-mini

O chat usa o modelo **GPT-4o-mini** da OpenAI. A escolha foi por **eficiência de custo** — eu pago a chave da API do meu bolso! 💰 Para liberar o projeto para testes sem estourar o orçamento, um modelo mais acessível faz mais sentido. Mas isso é **perfeitamente ajustável**: trocar para GPT-4o, GPT-4-turbo ou qualquer modelo mais recente é questão de uma única variável de ambiente. Sem `OPENAI_API_KEY`, o chat responde com um assistente stub declarado em dev e retorna 503 em produção.

### 🕷️ ETL de Scraping — a cereja do bolo 🍒

O scraper é uma das partes que mais me orgulho nesse projeto. Ele coleta automaticamente conteúdo cristão do site wgospel.com/tempoderefletir, processa e armazena os posts no banco com tags e categorização.

**Hoje ele já faz:**
- Coleta automatizada de artigos e reflexões
- Processamento e limpeza do conteúdo
- Persistência estruturada com metadados no PostgreSQL
- Histórico de execuções (últimas 20 runs) para auditoria

**O que vem por aí:** 🔮 Tenho grandes planos de melhoria — adicionar mais fontes de conteúdo, agendamento com filas assíncronas (Fase 3), geração de embeddings para busca semântica e integração com o chat bíblico para respostas fundamentadas em conteúdo real.

---

## 🖼️ Screenshots das Páginas

- **Landing (/landing)** — herói com call-to-action para captar novos usuários.
  
  ![Landing](front-end/screenshots/imagens-readme/landing.png)

- **Login (/login)** — acesso seguro com formulário simples e claro.
  
  ![Login](front-end/screenshots/imagens-readme/login.png)

- **Cadastro (/cadastro)** — criação de conta com validações básicas.
  
  ![Cadastro](front-end/screenshots/imagens-readme/cadastro.png)

- **Recuperar Senha (/recuperar-senha)** — fluxo de recuperação por e-mail.
  
  ![Recuperar Senha](front-end/screenshots/imagens-readme/recuperar-senha.png)

- **Home (/)** — post do dia em destaque, posts recentes e CTA para chat bíblico.
  
  ![Home](front-end/screenshots/imagens-readme/home.png)

- **Post Detalhe (/post/:id)** — player de áudio do devocional, resumo por IA, tags e aba devocional completa.
  
  ![Post Detalhe](front-end/screenshots/imagens-readme/post-detalhe.png)

- **Chat Bíblico (/chat)** — conversa com IA com sugestões e respostas citadas.
  
  ![Chat](front-end/screenshots/imagens-readme/chat.png)

- **Biblioteca (/biblioteca)** — favoritos e histórico pessoal de leituras.
  
  ![Biblioteca](front-end/screenshots/imagens-readme/biblioteca.png)

- **Configurações (/configuracoes)** — ajustes de perfil, tema e preferências de IA/notificações.
  
  ![Configurações](front-end/screenshots/imagens-readme/configuracoes.png)

- **Admin Monitor (/admin)** — painel com métricas, execuções de ETL e alertas operacionais.
  
  ![Admin](front-end/screenshots/imagens-readme/admin.png)

---

## 🏗️ Estrutura do Projeto

```text
vida-com-deus-IA/
│
├── front-end/                        # ⚛️ Aplicacao React 19 + Vite + Tailwind v4
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/                 # LoginForm, ProtectedRoute
│   │   │   ├── layout/               # BottomNavigation, SecondaryTopbar
│   │   │   └── therapist/            # OverviewView, PatientListView, PatientDetail, PatientIntakeForm, SessionForm, SessionCard
│   │   ├── pages/                    # 11 páginas implementadas
│   │   ├── store/                    # useAuthStore (Zustand)
│   │   └── lib/                      # api.ts (cliente HTTP), utils.ts (cn())
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
    │   │   └── v1/                   # auth, users, posts, library, chat, admin, therapist
    │   ├── core/                     # config.py · security.py (JWT) · dependencies.py · storage.py · scraper.py · database.py
    │   ├── domain/                   # Schemas Pydantic por domínio
    │   ├── models/                   # Modelos SQLAlchemy 2.0 (User, Post, Favorite, Conversation, etc.)
    │   ├── repositories/             # Repositórios de acesso a dados (user, post, library, chat)
    │   └── services/                 # Lógica de negócio (auth, user, post, library, chat)
    │   └── integrations/             # openai_client.py — assistente real + stub declarado
    ├── migrations/                   # Migrações Alembic — 6 versões, criam o banco do zero
    ├── data/                         # JSON local — apenas therapist e histórico de ETL
    └── tests/
        ├── unit/                     # JWT, configuração e schemas (sem banco)
        ├── integration/              # Auth, tokens, autorização e chat contra PostgreSQL real
        └── contract/                 # Status HTTP e formato de resposta
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
| Validação | Pydantic v2 |
| Autenticação | JWT (python-jose) + Argon2 (passlib) |
| ORM | SQLAlchemy 2.0 async + psycopg3 |
| Migrações | Alembic |
| Banco de Dados | PostgreSQL |
| Inteligência Artificial | OpenAI GPT-4o-mini (ajustável) |
| Gerenciador de Pacotes | uv |
| Testes | pytest + pytest-asyncio |

### Ferramentas de Desenvolvimento com IA 🤖

| Ferramenta | Uso |
| --- | --- |
| Claude Code (Anthropic) | Arquitetura, implementação, refatoração e testes |
| Cursor IDE | Prototipação de layout com regras e agentes customizados |
| CLAUDE.md | Contexto de projeto — "memória permanente" para o agente |

---

## 🔌 Arquitetura Backend

O backend é uma API FastAPI modular orientada a domínios. A **Fase 1.5** entregou persistência em arquivos JSON locais, ETL real e integração com GPT-4o-mini. A **Fase 2** substituiu isso por PostgreSQL: modelos SQLAlchemy 2.0, repositórios, serviços e 6 migrações Alembic, com autenticação real (Argon2, sessões, rotação e revogação de refresh token).

```text
Requisição HTTP
    → api/v1/<dominio>.py        (rota + validação)
    → services/<dominio>.py      (lógica de negócio)
    → repositories/<dominio>.py  (acesso a dados)
    → models/<dominio>.py        (SQLAlchemy)
    → PostgreSQL
```

**Estado real por categoria:**

| Funcionalidade | Estado |
| --- | --- |
| Cadastro, login e sessões no banco | **Implementado** |
| Rotação, revogação e detecção de reuso de refresh token | **Implementado** |
| Posts, biblioteca, chat e métricas admin no PostgreSQL | **Implementado** |
| Recuperação de senha | **Parcial** — o token é gerado, mas não há envio de email |
| Chat com IA | **Implementado** — sem `OPENAI_API_KEY`: resposta marcada como simulada em dev, 503 em produção |
| Painel therapist | **Simulado** — ainda em JSON local |
| Redis e workers assíncronos | **Planejado** (Fase 3) |

**Endpoints disponíveis em `/v1`:**

| Domínio | Prefixo |
| ------- | ------- |
| Auth | `/auth/{signup,login,refresh,logout,logout-all,forgot-password,reset-password}` |
| Usuário | `/users/me`, `/users/me/settings` |
| Posts | `/posts/feed`, `/posts/{id}`, `/posts/{id}/audio` |
| Biblioteca | `/library/`, `/library/favorites/{id}` |
| Chat | `/chat/conversations`, `/chat/conversations/{id}/messages` |
| Therapist | `/therapist/overview`, `/therapist/patients`, `/therapist/patients/{id}`, e sub-rotas de status, limite e sessões |
| Admin | `/admin/metrics/storage`, `/admin/alerts`, `/admin/etl/runs/execute` |
| Health | `GET /health` (fora do prefixo `/v1`) |

---

## 🚀 Instalacao

### Pre-requisitos

- Node.js 20+
- Python 3.13
- [uv](https://docs.astral.sh/uv/) — `pip install uv`
- PostgreSQL 15+ — obrigatório; a API não sobe sem banco

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

# Criar os bancos de desenvolvimento e de testes
createdb vida_com_deus
createdb vida_com_deus_test

# Configurar variáveis de ambiente
cp .env.example .env
# JWT_SECRET_KEY, DATABASE_URL e OPENAI_API_KEY são configuradas no .env.
# JWT_SECRET_KEY e DATABASE_URL são obrigatórios — não têm valor padrão.
# Gere o segredo: python -c "import secrets; print(secrets.token_urlsafe(48))"

# Conferir a configuração antes de subir (mesmo passo do CI)
uv run python -m app.core.config_check

# Aplicar migrações (criam o banco do zero)
uv run alembic upgrade head

# Iniciar servidor (uv run ativa o .venv automaticamente)
uv run uvicorn app.main:app --reload
```

API disponivel em `http://localhost:8000` · Swagger UI em `http://localhost:8000/docs`.

### Testes do backend

```bash
cd back-end
uv run pytest tests/unit           # sem banco
TEST_DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/vida_com_deus_test \
  uv run pytest                    # suíte completa, com banco isolado
```

Sem `TEST_DATABASE_URL` os testes de banco são pulados com motivo explícito. No CI (`.github/workflows/backend-ci.yml`), `REQUIRE_DB=1` transforma esse pulo em falha — a suíte só passa tendo realmente tocado o PostgreSQL.

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
- **PostgreSQL profissional** — de queries raw com `pg` para SQLAlchemy ORM + Alembic migrations
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
