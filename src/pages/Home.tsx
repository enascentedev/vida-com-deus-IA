import {
  Bell,
  BookOpen,
  ChevronRight,
  Home as HomeIcon,
  MessageSquare,
  Mic,
  Search,
  Settings,
  Bookmark,
  Play,
  Star,
  Sparkles,
} from "lucide-react"
import { Button, Badge, Skeleton } from "vida-com-deus-ui"

/* -------------------------------------------------------------------------- */
/*  Imagens placeholder (substituir por imagens reais depois)                  */
/* -------------------------------------------------------------------------- */
const HERO_IMAGE = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
const THUMB_BIBLE = "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=200&q=80"
const THUMB_PRAY = "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=200&q=80"
const AVATAR_URL = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"

/* -------------------------------------------------------------------------- */
/*  Topbar                                                                     */
/* -------------------------------------------------------------------------- */
function Topbar() {
  return (
    <header className="flex items-center justify-between px-5 py-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
          <Sparkles size={20} className="text-blue-600" />
        </div>
        <h1 className="text-lg font-bold text-slate-800">Vida com Deus</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2" aria-label="Notificacoes">
          <Bell size={22} className="text-slate-600" />
        </button>
        <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-blue-100">
          <img
            src={AVATAR_URL}
            alt="Avatar do usuario"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  )
}

/* -------------------------------------------------------------------------- */
/*  Barra de busca                                                             */
/* -------------------------------------------------------------------------- */
function SearchBar() {
  return (
    <div className="px-5 pb-4">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          placeholder="Buscar reflexoes ou versiculos..."
          className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
        />
        <button aria-label="Busca por voz">
          <Mic size={18} className="text-slate-400" />
        </button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Hero Card (Post do Dia)                                                    */
/* -------------------------------------------------------------------------- */
function HeroCard() {
  return (
    <div className="px-5">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl">
        {/* Imagem de fundo com overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_IMAGE}
            alt="Montanhas ao amanhecer"
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        <div className="relative z-10 space-y-4 p-6">
          <Badge className="border-none bg-blue-600 px-3 hover:bg-blue-600">
            POST DO DIA
          </Badge>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-300">
              24 de maio, 2024
            </p>
            <h2 className="text-2xl font-bold leading-tight">
              Encontrando Paz no Meio do Caos
            </h2>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen size={18} className="text-blue-400" />
              <span>Salmos 23:1</span>
            </div>
            <Button className="rounded-xl bg-blue-600 px-6 hover:bg-blue-700">
              Ler Reflexao
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Banner de Audio                                                            */
/* -------------------------------------------------------------------------- */
function AudioBanner() {
  return (
    <div className="px-5 pt-4">
      <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <Settings size={16} className="text-blue-600" />
          </div>
          <span className="text-sm font-medium text-blue-800">
            Quer um resumo em audio desta reflexao?
          </span>
        </div>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600"
          aria-label="Ouvir audio"
        >
          <Play size={14} className="text-white" fill="white" />
        </button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Post Recente                                                               */
/* -------------------------------------------------------------------------- */
interface RecentPostProps {
  title: string
  reference: string
  category: string
  date: string
  thumbnail: string
  isNew?: boolean
  isStarred?: boolean
}

function RecentPost({
  title,
  reference,
  category,
  date,
  thumbnail,
  isNew,
  isStarred,
}: RecentPostProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
        <img
          src={thumbnail}
          alt={title}
          className="h-full w-full object-cover"
        />
        {isNew && (
          <div className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {isNew && (
            <Badge
              variant="secondary"
              className="h-4 border-none bg-blue-50 px-1.5 text-[10px] text-blue-600"
            >
              NOVO
            </Badge>
          )}
          {isStarred && <Star size={12} className="fill-amber-400 text-amber-400" />}
          <span className="text-xs text-slate-400">{date}</span>
        </div>
        <h3 className="truncate font-bold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500">
          {reference} • {category}
        </p>
      </div>
      <ChevronRight size={20} className="flex-shrink-0 text-slate-300" />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Skeleton Loader para post                                                  */
/* -------------------------------------------------------------------------- */
function PostSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <Skeleton className="h-16 w-16 flex-shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Secao de Posts Recentes                                                    */
/* -------------------------------------------------------------------------- */
function RecentPostsSection() {
  return (
    <div className="space-y-3 px-5 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Posts Recentes</h2>
        <button className="text-sm font-semibold text-blue-600">Ver tudo</button>
      </div>

      <div className="space-y-3">
        <RecentPost
          title="A Forca na Fraqueza"
          reference="2 Corintios 12:9"
          category="Reflexao Diaria"
          date="Ha 2 horas"
          thumbnail={THUMB_BIBLE}
          isNew
        />
        <RecentPost
          title="O Proposito no Deserto"
          reference="Exodo 3:1-10"
          category="Serie Moises"
          date="Ontem"
          thumbnail={THUMB_PRAY}
          isStarred
        />
        <PostSkeleton />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  CTA Chat Biblico                                                           */
/* -------------------------------------------------------------------------- */
function ChatCTA() {
  return (
    <div className="px-5 pt-6 pb-4">
      <div className="rounded-3xl bg-blue-600 p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Chat Biblico com IA</h3>
            <p className="text-sm text-blue-100">
              Tire duvidas sobre a palavra agora.
            </p>
          </div>
          <MessageSquare size={28} className="text-blue-200" />
        </div>
        <Button
          className="mt-4 w-full rounded-xl border-2 border-white bg-white text-blue-600 font-semibold hover:bg-blue-50"
        >
          Iniciar Conversa
        </Button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Bottom Navigation                                                          */
/* -------------------------------------------------------------------------- */
interface NavItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
}

function NavItem({ icon, label, active }: NavItemProps) {
  return (
    <button
      className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
        active ? "text-blue-600" : "text-slate-400"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function BottomNavigation() {
  return (
    <nav className="sticky bottom-0 z-50 flex items-center border-t border-slate-100 bg-white/95 backdrop-blur-sm px-2 pb-safe">
      <NavItem icon={<HomeIcon size={22} />} label="Inicio" active />
      <NavItem icon={<MessageSquare size={22} />} label="Chat" />
      <NavItem icon={<Bookmark size={22} />} label="Salvos" />
      <NavItem icon={<Settings size={22} />} label="Admin" />
    </nav>
  )
}

/* -------------------------------------------------------------------------- */
/*  Pagina Home                                                                */
/* -------------------------------------------------------------------------- */
export function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Topbar />

      {/* Conteudo scrollavel */}
      <main className="flex-1 overflow-y-auto pb-20">
        <SearchBar />
        <HeroCard />
        <AudioBanner />
        <RecentPostsSection />
        <ChatCTA />
      </main>

      <BottomNavigation />
    </div>
  )
}
