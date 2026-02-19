import { useState } from "react"
import { ChevronLeft, BookOpen, Plus, Send, ChevronUp } from "lucide-react"
import { useNavigate } from "react-router-dom"

const AVATAR_URL =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"

/* -------------------------------------------------------------------------- */
/*  Tipos                                                                      */
/* -------------------------------------------------------------------------- */
interface Citation {
  reference: string
}

interface Message {
  id: number
  type: "user" | "ai"
  text: string
  citations?: Citation[]
  loading?: boolean
}

/* -------------------------------------------------------------------------- */
/*  Bubble do usuário                                                          */
/* -------------------------------------------------------------------------- */
function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm">
        <p className="text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Bubble da IA com citações                                                  */
/* -------------------------------------------------------------------------- */
interface AIBubbleProps {
  text: string
  citations: Citation[]
  loading?: boolean
}

function AIBubble({ text, citations, loading }: AIBubbleProps) {
  const [expanded, setExpanded] = useState(true)

  if (loading) {
    return (
      <div className="flex items-start gap-2 opacity-60">
        <div className="w-8 h-8 rounded-xl bg-slate-200 flex shrink-0 items-center justify-center text-slate-400">
          <BookOpen size={14} />
        </div>
        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse delay-75" />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse delay-150" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex shrink-0 items-center justify-center text-white">
          <BookOpen size={14} />
        </div>
        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm max-w-[88%]">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Resposta
            </span>
            <p className="text-sm leading-relaxed text-slate-700">{text}</p>
          </div>
          {citations.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                Citações
              </span>
              <div className="flex flex-wrap gap-2">
                {citations.map((c) => (
                  <button
                    key={c.reference}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 text-blue-600 text-xs font-semibold rounded-full border border-blue-600/20"
                  >
                    <BookOpen size={12} />
                    {c.reference}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trechos utilizados */}
      {citations.length > 0 && (
        <div className="ml-10 max-w-[88%] border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-3 flex items-center justify-between w-full border-b border-slate-200"
          >
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-600 tracking-tight">
                Trechos utilizados
              </span>
            </div>
            <ChevronUp
              size={16}
              className={`text-slate-400 transition-transform ${expanded ? "" : "rotate-180"}`}
            />
          </button>
          {expanded && (
            <div className="p-3 space-y-3">
              {citations.map((c) => (
                <div
                  key={c.reference}
                  className="bg-white p-2.5 rounded-xl border border-slate-200"
                >
                  <p className="text-[10px] font-bold text-blue-600 mb-1 uppercase tracking-wider">
                    {c.reference}
                  </p>
                  <p className="text-[11px] leading-relaxed italic text-slate-500">
                    "Entregue ao Senhor todas as suas preocupações, pois ele tem cuidado de
                    vocês."
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Chips de Sugestão                                                          */
/* -------------------------------------------------------------------------- */
const SUGGESTIONS = [
  "✨ Versículos de paz",
  "📖 Estudo sobre fé",
  "🙏 Oração e conforto",
  "🛡️ Proteção espiritual",
]

/* -------------------------------------------------------------------------- */
/*  Página BiblicalAIChat                                                      */
/* -------------------------------------------------------------------------- */
const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    type: "user",
    text: "O que a Bíblia diz sobre superar a ansiedade em tempos difíceis?",
  },
  {
    id: 2,
    type: "ai",
    text: "A Bíblia oferece um conforto profundo para a ansiedade. Ela nos orienta a entregar nossas preocupações a Deus, confiando em Sua soberania e cuidado constante. O apóstolo Paulo nos ensina a substituir a preocupação pela oração e gratidão.",
    citations: [
      { reference: "Filipenses 4:6-7" },
      { reference: "1 Pedro 5:7" },
      { reference: "Mateus 6:34" },
    ],
  },
  {
    id: 3,
    type: "ai",
    text: "",
    loading: true,
  },
]

export function BiblicalAIChat() {
  const navigate = useNavigate()
  const [messages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState("")

  function handleSend() {
    if (!input.trim()) return
    setInput("")
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-blue-600"
              aria-label="Voltar"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-lg font-bold leading-tight">Chat Bíblico IA</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Online
                </span>
              </div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-100">
            <img src={AVATAR_URL} alt="Perfil do usuário" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Mensagens */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-4 max-w-md mx-auto w-full">
        {/* Boas-vindas */}
        <div className="flex flex-col items-center mb-8 text-center pt-4">
          <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen size={32} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">Paz do Senhor!</h2>
          <p className="text-sm text-slate-400 px-8">
            Estou aqui para ajudar você a explorar as Escrituras Sagradas.
          </p>
        </div>

        <div className="space-y-6">
          {messages.map((msg) =>
            msg.type === "user" ? (
              <UserBubble key={msg.id} text={msg.text} />
            ) : (
              <AIBubble
                key={msg.id}
                text={msg.text}
                citations={msg.citations ?? []}
                loading={msg.loading}
              />
            )
          )}
        </div>
      </main>

      {/* Input */}
      <div className="shrink-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 pt-3 pb-8">
        <div className="max-w-md mx-auto px-4">
          {/* Sugestões */}
          <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-none">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="flex-shrink-0 px-4 py-2 bg-slate-100 text-xs font-medium rounded-full border border-slate-200 hover:border-blue-600 hover:text-blue-600 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Campo de input */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
              aria-label="Adicionar anexo"
            >
              <Plus size={22} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 placeholder-slate-400 outline-none"
              placeholder="Digite sua dúvida bíblica..."
            />
            <button
              onClick={handleSend}
              className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
              aria-label="Enviar mensagem"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
