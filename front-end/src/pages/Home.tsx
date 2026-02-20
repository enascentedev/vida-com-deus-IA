import {
  Bell,
  BookOpen,
  ChevronRight,
  MessageSquare,
  Mic,
  Search,
  Play,
  Star,
  Sparkles,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button, Badge, Skeleton } from "vida-com-deus-ui"
import { BottomNavigation } from "@/components/layout/BottomNavigation"

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
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10">
            <Sparkles size={20} className="text-blue-600" />
          </div>
          <h1 className="text-lg font-bold text-slate-800">Vida com Deus</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100"
            aria-label="Notificações"
          >
            <Bell size={22} className="text-slate-600" />
          </button>
          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-blue-100">
            <img
              src={AVATAR_URL}
              alt="Avatar do usuário"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
      {/* Barra de busca */}
      <div className="px-4 pb-3 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 h-11 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-600/20 focus-within:bg-white">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar reflexões ou versículos..."
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
          />
          <button aria-label="Busca por voz" className="transition-transform duration-200 hover:scale-110 active:scale-95">
            <Mic size={18} className="text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  )
}

/* -------------------------------------------------------------------------- */
/*  Hero Card (Post do Dia)                                                    */
/* -------------------------------------------------------------------------- */
function HeroCard() {
  const navigate = useNavigate()
  return (
    <div className="px-4 py-4 animate-slide-up">
      <div className="relative overflow-hidden rounded-2xl shadow-[0_8px_40px_-8px_rgb(15_23_42/0.30)] bg-slate-900 text-white transition-shadow duration-300 hover:shadow-[0_16px_48px_-8px_rgb(15_23_42/0.40)]">
        {/* Badge */}
        <div className="absolute top-4 left-4 z-10">
          <Badge className="border-none bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-600">
            Post do Dia
          </Badge>
        </div>
        {/* Imagem */}
        <div className="w-full aspect-[16/9] relative overflow-hidden">
          <img
            src={HERO_IMAGE}
            alt="Pôr do sol sobre lago, representando paz"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
        {/* Conteúdo */}
        <div className="absolute bottom-0 w-full p-5">
          <p className="text-xs opacity-80 mb-1 uppercase font-medium">24 de Maio, 2024</p>
          <h2 className="text-2xl font-bold leading-tight mb-3">
            Encontrando Paz no Meio do Caos
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen size={16} className="text-blue-400" />
              <span>Salmos 23:1</span>
            </div>
            <Button
              onClick={() => navigate("/post/1")}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all duration-200"
            >
              Ler Reflexão
            </Button>
          </div>
        </div>
      </div>

      {/* AI Insight Trigger */}
      <div className="mt-3 bg-blue-600/5 border border-blue-600/20 rounded-xl p-3 flex items-center justify-between transition-colors duration-200 hover:bg-blue-600/8 hover:border-blue-600/30">
        <div className="flex items-center gap-3">
          <Sparkles size={20} className="text-blue-600 shrink-0" />
          <p className="text-xs font-medium text-blue-700">
            Quer um resumo em áudio desta reflexão?
          </p>
        </div>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/30 active:scale-95"
          aria-label="Ouvir áudio"
        >
          <Play size={14} className="text-white fill-white" />
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
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate("/post/1")}
      className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm w-full text-left transition-all duration-200 hover:shadow-[0_4px_20px_-4px_rgb(37_99_235/0.12)] hover:-translate-y-0.5 active:scale-[0.99]"
    >
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
        <img src={thumbnail} alt={title} className="h-full w-full object-cover" />
        {isNew && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          {isNew && (
            <Badge
              variant="secondary"
              className="h-4 border-none bg-blue-50 px-1.5 text-[10px] text-blue-600 font-bold uppercase"
            >
              Novo
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
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/*  Skeleton Loader para post                                                  */
/* -------------------------------------------------------------------------- */
function PostSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-dashed border-slate-200 p-3 opacity-60">
      <Skeleton className="h-16 w-16 flex-shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Seção de Posts Recentes                                                    */
/* -------------------------------------------------------------------------- */
function RecentPostsSection() {
  return (
    <div className="space-y-3 px-4 pb-4 animate-slide-up">
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-xl font-bold tracking-tight text-slate-800">Posts Recentes</h2>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200">Ver tudo</button>
      </div>
      <div className="space-y-3">
        <RecentPost
          title="A Força na Fraqueza"
          reference="2 Coríntios 12:9"
          category="Reflexão Diária"
          date="Há 2 horas"
          thumbnail={THUMB_BIBLE}
          isNew
        />
        <RecentPost
          title="O Propósito no Deserto"
          reference="Êxodo 3:1-10"
          category="Série Moisés"
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
/*  CTA Chat Bíblico                                                           */
/* -------------------------------------------------------------------------- */
function ChatCTA() {
  const navigate = useNavigate()
  return (
    <div className="px-4 pb-6 animate-slide-up">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-[0_8px_32px_-4px_rgb(37_99_235/0.40)] transition-all duration-300 hover:shadow-[0_16px_40px_-4px_rgb(37_99_235/0.50)] hover:-translate-y-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold">Chat Bíblico com IA</h3>
            <p className="text-sm text-blue-100">Tire dúvidas sobre a palavra agora.</p>
          </div>
          <MessageSquare size={28} className="text-blue-200" />
        </div>
        <Button
          onClick={() => navigate("/chat")}
          className="w-full bg-white text-blue-600 font-bold rounded-lg text-sm hover:bg-slate-50 active:scale-[0.98] transition-all duration-200"
        >
          Iniciar Conversa
        </Button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Página Home                                                                */
/* -------------------------------------------------------------------------- */
export function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Topbar />

      <main className="flex-1 pb-4 max-w-2xl mx-auto w-full">
        <HeroCard />
        <RecentPostsSection />
        <ChatCTA />
      </main>

      <div className="max-w-2xl mx-auto w-full">
        <BottomNavigation />
      </div>
    </div>
  )
}
