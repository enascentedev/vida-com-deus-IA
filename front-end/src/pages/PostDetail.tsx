import { useState, useEffect, useRef } from "react"
import { Heart, Share2, Play, Pause, CheckCircle, BookOpen, Sparkles, Check } from "lucide-react"
import { useParams, useNavigate } from "react-router-dom"
import { postsApi, libraryApi } from "@/lib/api"
import type { PostDetail as PostDetailType } from "@/lib/api"
import { Badge, Skeleton } from "vida-com-deus-ui"
import { SecondaryTopbar } from "@/components/layout/SecondaryTopbar"

const THUMB_URL =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"

/* -------------------------------------------------------------------------- */
/*  Player de Áudio                                                            */
/* -------------------------------------------------------------------------- */
type AudioState = "idle" | "playing" | "paused" | "unavailable"

function AudioPlayer({
  thumbnailUrl,
  duration,
  audioUrl,
}: {
  thumbnailUrl: string | null
  duration: string | null
  audioUrl: string | null
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [audioState, setAudioState] = useState<AudioState>(
    audioUrl ? "idle" : "unavailable",
  )
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)

  // Cria o elemento de áudio quando a URL estiver disponível
  useEffect(() => {
    if (!audioUrl) { setAudioState("unavailable"); return }

    const audio = new Audio(audioUrl)
    audioRef.current = audio
    audio.onloadedmetadata = () => setTotalDuration(audio.duration)
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime)
    audio.onended = () => { setAudioState("idle"); setCurrentTime(0) }
    audio.onerror = () => setAudioState("unavailable")

    return () => { audio.pause(); audioRef.current = null }
  }, [audioUrl])

  function handlePlayPause() {
    const audio = audioRef.current
    if (!audio) return
    if (audioState === "playing") {
      audio.pause()
      setAudioState("paused")
    } else {
      audio.play()
      setAudioState("playing")
    }
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current
    if (!audio || !totalDuration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audio.currentTime = ratio * totalDuration
  }

  function fmt(secs: number) {
    if (!isFinite(secs) || secs < 0) return "0:00"
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0
  const remaining = totalDuration > 0 ? totalDuration - currentTime : 0

  return (
    <div className="mx-4 my-3 flex rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-[0_4px_24px_-4px_rgb(37_99_235/0.10)]">
      {/* Imagem — preenche toda a altura do card (igual ao RecentPost da Home) */}
      <div className="relative shrink-0 w-32 self-stretch min-h-[110px]">
        <img
          src={thumbnailUrl ?? THUMB_URL}
          alt="Capa do áudio"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-y-0 right-0 w-4 bg-linear-to-r from-transparent to-black/10" />
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col justify-between flex-1 min-w-0 px-4 py-3">
        {/* Cabeçalho: título + botão play */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-slate-900 text-[15px] font-bold leading-snug truncate">
              Devocional em Áudio
            </p>
            <p className="text-slate-400 text-sm truncate mt-0.5">
              Vida com Deus • {duration ?? "—"}
            </p>
          </div>
          <button
            onClick={handlePlayPause}
            disabled={audioState === "unavailable"}
            className="flex shrink-0 items-center justify-center rounded-full size-11 bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:shadow-xl hover:shadow-blue-600/30 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={audioState === "playing" ? "Pausar áudio" : "Reproduzir áudio"}
          >
            {audioState === "playing"
              ? <Pause size={18} className="fill-white" />
              : <Play size={18} className="fill-white ml-0.5" />}
          </button>
        </div>

        {/* Barra de progresso clicável */}
        <div className="mt-3">
          <div
            className="relative flex h-5 items-center cursor-pointer"
            onClick={handleSeek}
            aria-label="Barra de progresso do áudio"
          >
            <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600 transition-[width] duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div
              className="absolute h-3.5 w-3.5 rounded-full bg-blue-600 border-2 border-white shadow -translate-x-1/2"
              style={{ left: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-slate-400 text-xs font-medium">{fmt(currentTime)}</span>
            <span className="text-slate-400 text-xs font-medium">-{fmt(remaining)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Tabs de Conteúdo                                                           */
/* -------------------------------------------------------------------------- */
type Tab = "resumo" | "tags" | "devocional"

function TabContentSummary({ post }: { post: PostDetailType }) {
  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-blue-600" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
          AI Insights
        </span>
      </div>
      <p className="text-slate-700 text-base font-normal leading-relaxed">{post.ai_summary}</p>
      <div className="mt-6 pt-6 border-t border-slate-100">
        <p className="text-sm font-bold text-slate-900 mb-3">Pontos-Chave</p>
        <ul className="space-y-3">
          {post.key_points.map((kp, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-600">{kp.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function TabContentTags({ tags }: { tags: string[] }) {
  return (
    <div className="p-5">
      <p className="text-sm font-bold text-slate-900 mb-3">Tópicos Relacionados</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200 transition-all duration-150 hover:border-blue-600/30 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function TabContentDevocional({ meditation, prayer }: { meditation: string; prayer: string }) {
  return (
    <div className="p-5">
      <p className="text-slate-700 text-base leading-relaxed">{meditation}</p>
      <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
          Oração do Dia
        </p>
        <p className="text-sm text-slate-700 italic leading-relaxed">"{prayer}"</p>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Skeleton da página                                                         */
/* -------------------------------------------------------------------------- */
function PostDetailSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 pb-20">
      <div className="mx-4 my-3 flex rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <Skeleton className="shrink-0 w-32 min-h-[110px] rounded-none" />
        <div className="flex-1 px-4 py-3 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-1.5 w-full mt-4 rounded-full" />
        </div>
      </div>
      <div className="px-4 pt-2 space-y-2">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="px-4 mt-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
      <div className="px-4 mt-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Página PostDetail                                                          */
/* -------------------------------------------------------------------------- */
export function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>("resumo")
  const [post, setPost] = useState<PostDetailType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [shareFeedback, setShareFeedback] = useState<"idle" | "shared" | "copied">("idle")

  // Carrega os dados do post ao montar o componente
  useEffect(() => {
    if (!id) return
    let cancelled = false
    postsApi.getPost(id)
      .then((data) => { if (!cancelled) setPost(data) })
      .catch(() => { /* manter isLoading false */ })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [id])

  // Toggle de favorito com update otimista
  async function handleFavoriteToggle() {
    if (!post) return
    setIsFavorited((v) => !v)
    try {
      if (isFavorited) {
        await libraryApi.removeFavorite(post.id)
      } else {
        await libraryApi.addFavorite(post.id)
      }
    } catch {
      setIsFavorited((v) => !v) // reverte em caso de erro
    }
  }

  // Compartilhar: Web Share API com fallback para copiar link
  async function handleShare() {
    const url = window.location.href
    const title = post?.title ?? "Vida com Deus"

    if (navigator.share) {
      try {
        await navigator.share({ title, text: `Confira: ${title}`, url })
        setShareFeedback("shared")
      } catch {
        // usuário cancelou — não mostrar erro
      }
    } else {
      await navigator.clipboard.writeText(url)
      setShareFeedback("copied")
    }

    setTimeout(() => setShareFeedback("idle"), 2500)
  }

  const ShareIcon = shareFeedback === "copied" ? Check : shareFeedback === "shared" ? Check : Share2
  const shareLabel =
    shareFeedback === "copied" ? "Link copiado!" :
    shareFeedback === "shared" ? "Compartilhado!" :
    "Compartilhar"

  if (isLoading) return <PostDetailSkeleton />

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 pb-20">
      <SecondaryTopbar
        title="Post"
        rightSlot={
          <div className="flex items-center gap-3">
            <button
              onClick={handleFavoriteToggle}
              aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              className="transition-transform duration-200 hover:scale-110 active:scale-95"
            >
              <Heart
                size={22}
                className={isFavorited ? "fill-blue-600 text-blue-600" : "text-slate-400"}
              />
            </button>
            <button
              onClick={handleShare}
              aria-label={shareLabel}
              title={shareLabel}
              className="relative transition-transform duration-200 hover:scale-110 active:scale-95"
            >
              <ShareIcon
                size={22}
                className={shareFeedback !== "idle" ? "text-blue-600" : "text-slate-400"}
              />
              {/* Tooltip de feedback */}
              {shareFeedback !== "idle" && (
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-medium text-white shadow-lg">
                  {shareFeedback === "copied" ? "Link copiado!" : "Compartilhado!"}
                </span>
              )}
            </button>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto">
        {/* Player */}
        <AudioPlayer
          thumbnailUrl={post?.thumbnail_url ?? null}
          duration={post?.audio_duration ?? null}
          audioUrl={post?.audio_url ?? null}
        />

        {/* Título */}
        <div className="px-4 pt-2">
          <h1 className="text-slate-900 text-[28px] font-bold leading-tight pb-2">
            {post?.title ?? ""}
          </h1>
          <div className="flex items-center gap-2 mb-4">
            <Badge className="text-xs font-semibold px-2 py-0.5 bg-blue-600/10 text-blue-600 border-none hover:bg-blue-600/10">
              {post?.category ?? ""}
            </Badge>
            <span className="text-xs text-slate-400">{post?.date ?? ""}</span>
          </div>
        </div>

        {/* Versículo */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-6 border-l-4 border-blue-600 shadow-sm transition-all duration-200 hover:shadow-[0_4px_20px_-4px_rgb(37_99_235/0.12)] hover:-translate-y-0.5">
            <p className="text-slate-900 text-xl font-medium italic leading-relaxed">
              "{post?.verse_content ?? ""}"
            </p>
            <p className="text-blue-600 font-bold text-sm mt-4 text-right">
              — {post?.reference ?? ""}
            </p>
          </div>
        </div>

        {/* Tabs */}
        {post && (
          <div className="px-4">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="flex border-b border-slate-100 p-1 gap-1">
                {(["resumo", "tags", "devocional"] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex flex-1 items-center justify-center py-2.5 px-1 text-sm font-bold rounded-xl transition-all duration-200 ${
                      activeTab === tab
                        ? "bg-slate-50 text-blue-600 shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {tab === "resumo" ? "Resumo" : tab === "tags" ? "Tags" : "Devocional"}
                  </button>
                ))}
              </div>
              {activeTab === "resumo" && <TabContentSummary post={post} />}
              {activeTab === "tags" && <TabContentTags tags={post.tags} />}
              {activeTab === "devocional" && (
                <TabContentDevocional
                  meditation={post.devotional_meditation}
                  prayer={post.devotional_prayer}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* FAB - Chat com IA */}
      <div
        style={{
          animation:
            "bounce-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both, float 2.4s ease-in-out 0.9s infinite",
        }}
        className="fixed bottom-8 right-5 flex flex-col items-end gap-2"
      >
        {/* Tooltip */}
        <div className="bg-white/95 backdrop-blur-sm py-2.5 px-4 rounded-2xl shadow-[0_8px_32px_-4px_rgb(37_99_235/0.22)] border border-blue-100 relative">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-blue-500 shrink-0" />
            <p className="text-xs font-bold text-blue-600 whitespace-nowrap">
              Perguntar à IA sobre este versículo
            </p>
          </div>
          {/* Caret apontando para o botão */}
          <div className="absolute -bottom-1.5 right-7 size-3 rotate-45 bg-white/95 border-r border-b border-blue-100" />
        </div>

        {/* Botão FAB */}
        <button
          onClick={() => navigate("/chat")}
          className="size-14 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-600/40 active:scale-95 transition-transform duration-200 hover:scale-110 self-end"
          aria-label="Abrir chat bíblico com IA"
        >
          <BookOpen size={26} />
        </button>
      </div>
    </div>
  )
}
