import { useState } from "react"
import { Heart, Share2, Play, CheckCircle, BookOpen, Sparkles } from "lucide-react"
import { Badge } from "vida-com-deus-ui"
import { SecondaryTopbar } from "@/components/layout/SecondaryTopbar"
import { useNavigate } from "react-router-dom"

const THUMB_URL =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80"

/* -------------------------------------------------------------------------- */
/*  Player de Áudio                                                            */
/* -------------------------------------------------------------------------- */
function AudioPlayer() {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="mx-4 my-3 flex flex-col gap-3 rounded-2xl bg-white border border-slate-100 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-4 overflow-hidden">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
          <img
            src={THUMB_URL}
            alt="Capa do áudio"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-900 text-base font-bold leading-tight truncate">
            Devocional em Áudio
          </p>
          <p className="text-slate-400 text-sm truncate">Vida com Deus • 5 min</p>
        </div>
        <button
          onClick={() => setPlaying((v) => !v)}
          className="flex shrink-0 items-center justify-center rounded-full size-12 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
          aria-label={playing ? "Pausar áudio" : "Reproduzir áudio"}
        >
          <Play size={20} className="fill-white" />
        </button>
      </div>

      {/* Barra de Progresso */}
      <div>
        <div className="flex h-4 items-center justify-center mb-1">
          <div className="h-1.5 flex-1 rounded-full bg-blue-600" style={{ width: "40%" }} />
          <div className="relative mx-0">
            <div className="absolute -left-1.5 -top-1.5 size-3.5 rounded-full bg-blue-600 border-2 border-white" />
          </div>
          <div className="h-1.5 flex-1 rounded-full bg-slate-200" />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-xs font-medium">1:42</p>
          <p className="text-slate-400 text-xs font-medium">-3:18</p>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Tabs de Conteúdo                                                           */
/* -------------------------------------------------------------------------- */
type Tab = "resumo" | "tags" | "devocional"

interface TabContentSummaryProps {
  text: string
}

function TabContentSummary({ text }: TabContentSummaryProps) {
  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-blue-600" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
          AI Insights
        </span>
      </div>
      <p className="text-slate-700 text-base font-normal leading-relaxed">{text}</p>
      <div className="mt-6 pt-6 border-t border-slate-100">
        <p className="text-sm font-bold text-slate-900 mb-3">Pontos-Chave</p>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <CheckCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <span className="text-sm text-slate-600">O amor de Deus é ativo e sacrificial.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <span className="text-sm text-slate-600">A fé é a ponte para a vida eterna.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <span className="text-sm text-slate-600">
              A salvação é um dom acessível a todos.
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}

function TabContentTags() {
  const tags = [
    "#Salvação",
    "#AmorDeDeus",
    "#VidaEterna",
    "#EvangelhoDeJoão",
    "#Fé",
    "#Graça",
  ]
  return (
    <div className="p-5">
      <p className="text-sm font-bold text-slate-900 mb-3">Tópicos Relacionados</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function TabContentDevocional() {
  return (
    <div className="p-5">
      <p className="text-slate-700 text-base leading-relaxed">
        Medite neste versículo ao longo do dia. Deixe que o amor de Deus descrito em João
        3:16 inspire suas ações e relacionamentos. Pratique a gratidão pela dádiva da
        salvação e compartilhe essa mensagem com quem está ao seu redor.
      </p>
      <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
          Oração do Dia
        </p>
        <p className="text-sm text-slate-700 italic leading-relaxed">
          "Senhor, obrigado pelo Teu amor incomparável. Que eu possa refletir esse amor em
          todas as minhas atitudes hoje. Amém."
        </p>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Página PostDetail                                                          */
/* -------------------------------------------------------------------------- */
export function PostDetail() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>("resumo")
  const [liked, setLiked] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 pb-20">
      <SecondaryTopbar
        title="Post"
        rightSlot={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLiked((v) => !v)}
              aria-label={liked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Heart
                size={22}
                className={liked ? "fill-blue-600 text-blue-600" : "text-slate-400"}
              />
            </button>
            <button aria-label="Compartilhar">
              <Share2 size={22} className="text-slate-400" />
            </button>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto">
        {/* Player */}
        <AudioPlayer />

        {/* Título */}
        <div className="px-4 pt-2">
          <h1 className="text-slate-900 text-[28px] font-bold leading-tight pb-2">
            João 3:16 — O Amor de Deus
          </h1>
          <div className="flex items-center gap-2 mb-4">
            <Badge className="text-xs font-semibold px-2 py-0.5 bg-blue-600/10 text-blue-600 border-none hover:bg-blue-600/10">
              Novo Testamento
            </Badge>
            <span className="text-xs text-slate-400">24 de junho, 2024</span>
          </div>
        </div>

        {/* Versículo */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-6 border-l-4 border-blue-600 shadow-sm">
            <p className="text-slate-900 text-xl font-medium italic leading-relaxed">
              "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para
              que todo aquele que nele crê não pereça, mas tenha a vida eterna."
            </p>
            <p className="text-blue-600 font-bold text-sm mt-4 text-right">
              — João 3:16, NVI
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="flex border-b border-slate-100 p-1 gap-1">
              {(["resumo", "tags", "devocional"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex flex-1 items-center justify-center py-2.5 px-1 text-sm font-bold rounded-xl transition-colors ${
                    activeTab === tab
                      ? "bg-slate-50 text-blue-600 shadow-sm"
                      : "text-slate-400"
                  }`}
                >
                  {tab === "resumo" ? "Resumo" : tab === "tags" ? "Tags" : "Devocional"}
                </button>
              ))}
            </div>
            {activeTab === "resumo" && (
              <TabContentSummary text="Este versículo encapsula o núcleo da fé cristã: o amor sacrificial de Deus. Ele destaca que a salvação é um dom acessível a todos por meio da fé, transitando da morte espiritual para a vida eterna." />
            )}
            {activeTab === "tags" && <TabContentTags />}
            {activeTab === "devocional" && <TabContentDevocional />}
          </div>
        </div>
      </main>

      {/* FAB - Chat com IA */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end">
        <div className="mb-2 bg-white py-2 px-4 rounded-2xl shadow-lg border border-slate-100 animate-bounce">
          <p className="text-xs font-bold text-blue-600">Perguntar à IA sobre este versículo</p>
        </div>
        <button
          onClick={() => navigate("/chat")}
          className="size-16 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-600/40 active:scale-95 transition-transform"
          aria-label="Abrir chat bíblico com IA"
        >
          <BookOpen size={28} />
        </button>
      </div>
    </div>
  )
}
