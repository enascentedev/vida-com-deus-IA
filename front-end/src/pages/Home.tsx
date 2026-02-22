import { useState, useEffect, useRef } from "react"
import {
  Bell,
  BookOpen,
  ChevronRight,
  MessageSquare,
  Search,
  Play,
  Pause,
  Star,
  Sparkles,
  Loader2,
  Volume2,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { postsApi } from "@/lib/api"
import type { FeedResponse, PostSummary } from "@/lib/api"
import { useAuthStore } from "@/store/useAuthStore"
import { Button, Badge, Skeleton } from "vida-com-deus-ui"
import { BottomNavigation } from "@/components/layout/BottomNavigation"

/* -------------------------------------------------------------------------- */
/*  Imagens placeholder (usadas como fallback)                                 */
/* -------------------------------------------------------------------------- */
const HERO_IMAGE = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
// Silhueta genérica — mesmo padrão usado em /configuracoes
const AVATAR_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e2e8f0'/%3E%3Ccircle cx='50' cy='38' r='18' fill='%2394a3b8'/%3E%3Cellipse cx='50' cy='90' rx='32' ry='24' fill='%2394a3b8'/%3E%3C/svg%3E"

/* -------------------------------------------------------------------------- */
/*  Topbar                                                                     */
/* -------------------------------------------------------------------------- */
function Topbar({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string
  onSearchChange: (v: string) => void
}) {
  const avatarUrl = useAuthStore((s) => s.user?.avatar_url) ?? AVATAR_URL
  const navigate = useNavigate()
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
          <button
            onClick={() => navigate("/configuracoes")}
            className="h-10 w-10 overflow-hidden rounded-full border-2 border-blue-100 transition-opacity hover:opacity-80 active:scale-95"
            aria-label="Ir para configurações"
          >
            <img
              src={avatarUrl}
              alt="Avatar do usuário"
              className="h-full w-full object-cover"
            />
          </button>
        </div>
      </div>
      {/* Barra de busca */}
      <div className="px-4 pb-3 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 h-11 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-600/20 focus-within:bg-white">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar reflexões ou versículos..."
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              aria-label="Limpar busca"
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

/* -------------------------------------------------------------------------- */
/*  Hero Card (Post do Dia)                                                    */
/* -------------------------------------------------------------------------- */
type AudioState = "idle" | "loading" | "playing" | "paused" | "unavailable"

function HeroCard({ post }: { post: PostSummary | null }) {
  const navigate = useNavigate()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [audioState, setAudioState] = useState<AudioState>("idle")

  async function handlePlayAudio() {
    if (!post) return

    // Se já está tocando, pausa
    if (audioState === "playing" && audioRef.current) {
      audioRef.current.pause()
      setAudioState("paused")
      return
    }

    // Se está pausado, retoma
    if (audioState === "paused" && audioRef.current) {
      audioRef.current.play()
      setAudioState("playing")
      return
    }

    // Busca o post completo para obter audio_url
    setAudioState("loading")
    try {
      const detail = await postsApi.getPost(post.id)
      if (!detail.audio_url) {
        setAudioState("unavailable")
        setTimeout(() => setAudioState("idle"), 3000)
        return
      }
      const audio = new Audio(detail.audio_url)
      audioRef.current = audio
      audio.onended = () => setAudioState("idle")
      audio.onerror = () => { setAudioState("unavailable"); setTimeout(() => setAudioState("idle"), 3000) }
      await audio.play()
      setAudioState("playing")
    } catch {
      setAudioState("unavailable")
      setTimeout(() => setAudioState("idle"), 3000)
    }
  }

  // Para o áudio ao desmontar
  useEffect(() => {
    return () => { audioRef.current?.pause() }
  }, [])

  const audioIcon = audioState === "loading"
    ? <Loader2 size={14} className="text-white animate-spin" />
    : audioState === "playing"
    ? <Pause size={14} className="text-white fill-white" />
    : audioState === "unavailable"
    ? <Volume2 size={14} className="text-white opacity-50" />
    : <Play size={14} className="text-white fill-white" />

  const audioLabel =
    audioState === "loading" ? "Carregando áudio..." :
    audioState === "playing" ? "Pausar áudio" :
    audioState === "paused" ? "Retomar áudio" :
    audioState === "unavailable" ? "Áudio indisponível" :
    "Ouvir áudio"

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
        <div className="w-full aspect-video relative overflow-hidden">
          {post === null ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <>
              <img
                src={post.thumbnail_url ?? HERO_IMAGE}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
            </>
          )}
        </div>
        {/* Conteúdo */}
        <div className="absolute bottom-0 w-full p-5">
          {post === null ? (
            <div className="space-y-2">
              <Skeleton className="h-3 w-28 bg-white/20" />
              <Skeleton className="h-7 w-3/4 bg-white/20" />
              <Skeleton className="h-4 w-1/3 bg-white/20" />
            </div>
          ) : (
            <>
              <p className="text-xs opacity-80 mb-1 uppercase font-medium">{post.date}</p>
              <h2 className="text-2xl font-bold leading-tight mb-3">{post.title}</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen size={16} className="text-blue-400" />
                  <span>{post.reference}</span>
                </div>
                <Button
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all duration-200"
                >
                  Ler Reflexão
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* AI Insight Trigger */}
      <div className="mt-3 bg-blue-600/5 border border-blue-600/20 rounded-xl p-3 flex items-center justify-between transition-colors duration-200 hover:bg-blue-600/8 hover:border-blue-600/30">
        <div className="flex items-center gap-3">
          <Sparkles size={20} className="text-blue-600 shrink-0" />
          <p className="text-xs font-medium text-blue-700">
            {audioState === "unavailable"
              ? "Áudio ainda não disponível para esta reflexão."
              : "Quer um resumo em áudio desta reflexão?"}
          </p>
        </div>
        <button
          onClick={handlePlayAudio}
          disabled={audioState === "loading" || audioState === "unavailable" || post === null}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/30 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label={audioLabel}
        >
          {audioIcon}
        </button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Post Recente                                                               */
/* -------------------------------------------------------------------------- */
function RecentPost({ post }: { post: PostSummary }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/post/${post.id}`)}
      className="flex rounded-2xl border border-slate-100 bg-white shadow-sm w-full text-left overflow-hidden transition-all duration-200 hover:shadow-[0_6px_24px_-4px_rgb(37_99_235/0.15)] hover:-translate-y-0.5 active:scale-[0.99]"
    >
      {/* Imagem — preenche toda a altura do card, sem padding */}
      <div className="relative shrink-0 w-36 self-stretch min-h-[130px]">
        <img
          src={post.thumbnail_url ?? HERO_IMAGE}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Gradiente sutil para separar da borda */}
        <div className="absolute inset-y-0 right-0 w-4 bg-linear-to-r from-transparent to-black/10" />
        {post.is_new && (
          <span className="absolute top-2 left-2 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col justify-between flex-1 min-w-0 p-4">
        <div className="space-y-1.5">
          {/* Badges */}
          {(post.is_new || post.is_starred) && (
            <div className="flex items-center gap-1.5">
              {post.is_new && (
                <Badge
                  variant="secondary"
                  className="h-4 border-none bg-blue-50 px-1.5 text-[10px] text-blue-600 font-bold uppercase"
                >
                  Novo
                </Badge>
              )}
              {post.is_starred && <Star size={11} className="fill-amber-400 text-amber-400" />}
            </div>
          )}
          {/* Data */}
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
            {post.date}
          </p>
          {/* Título */}
          <h3 className="font-bold text-slate-800 leading-snug line-clamp-2 text-[15px]">
            {post.title}
          </h3>
          {/* Referência e categoria */}
          <p className="text-xs text-slate-400">
            <span className="text-blue-600 font-medium">{post.reference}</span>
            {" · "}
            {post.category}
          </p>
        </div>

        {/* Rodapé do card */}
        <div className="flex items-center justify-end pt-3">
          <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-0.5">
            Ler <ChevronRight size={13} className="mt-px" />
          </span>
        </div>
      </div>
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/*  Skeleton Loader para post                                                  */
/* -------------------------------------------------------------------------- */
function PostSkeleton() {
  return (
    <div className="flex rounded-2xl border border-dashed border-slate-200 bg-white overflow-hidden opacity-60">
      <Skeleton className="shrink-0 w-36 min-h-[130px] rounded-none" />
      <div className="flex-1 p-4 space-y-2.5">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Seção de Posts Recentes                                                    */
/* -------------------------------------------------------------------------- */
const INITIAL_VISIBLE = 3

function RecentPostsSection({
  posts,
  isLoading,
  searchQuery,
}: {
  posts: PostSummary[]
  isLoading: boolean
  searchQuery: string
}) {
  const [showAll, setShowAll] = useState(false)

  const filtered = searchQuery.trim()
    ? posts.filter((p) => {
        const q = searchQuery.toLowerCase()
        return (
          p.title.toLowerCase().includes(q) ||
          p.reference.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        )
      })
    : posts

  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE)
  const hasMore = filtered.length > INITIAL_VISIBLE

  return (
    <div className="space-y-3 px-4 pb-4 animate-slide-up">
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-xl font-bold tracking-tight text-slate-800">
          {searchQuery.trim() ? `Resultados para "${searchQuery}"` : "Posts Recentes"}
        </h2>
        {!searchQuery.trim() && hasMore && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            {showAll ? "Ver menos" : "Ver tudo"}
          </button>
        )}
      </div>
      <div className="space-y-3">
        {isLoading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            Nenhuma reflexão encontrada para "{searchQuery}".
          </p>
        ) : (
          visible.map((post) => <RecentPost key={post.id} post={post} />)
        )}
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
  const [feed, setFeed] = useState<FeedResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Carrega o feed ao montar o componente
  useEffect(() => {
    let cancelled = false
    postsApi.getFeed()
      .then((data) => { if (!cancelled) setFeed(data) })
      .catch(() => { if (!cancelled) setError("Não foi possível carregar o feed.") })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Topbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="flex-1 pb-4 max-w-2xl mx-auto w-full">
        {!searchQuery && <HeroCard post={feed?.post_of_day ?? null} />}
        {error && (
          <p className="text-sm text-red-500 text-center px-4 py-2">{error}</p>
        )}
        <RecentPostsSection
          posts={feed?.recent_posts ?? []}
          isLoading={isLoading}
          searchQuery={searchQuery}
        />
        {!searchQuery && <ChatCTA />}
      </main>

      <div className="max-w-2xl mx-auto w-full">
        <BottomNavigation />
      </div>
    </div>
  )
}
