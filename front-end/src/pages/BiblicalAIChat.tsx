import { useState, useEffect, useRef } from "react"
import { ChevronLeft, BookOpen, Plus, Send, ChevronUp } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { chatApi } from "@/lib/api"
import type { Citation } from "@/lib/api"
import { useAuthStore } from "@/store/useAuthStore"

const AVATAR_URL =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"

/* -------------------------------------------------------------------------- */
/*  Tipos locais                                                               */
/* -------------------------------------------------------------------------- */
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
    <div className="flex justify-end animate-slide-up">
      <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm shadow-blue-600/20">
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
    <div className="flex flex-col gap-3 animate-slide-up">
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
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 text-blue-600 text-xs font-semibold rounded-full border border-blue-600/20 transition-all duration-150 hover:bg-blue-600/20 hover:border-blue-600/40 active:scale-95"
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
export function BiblicalAIChat() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Avatar do usuário autenticado
  const avatarUrl = useAuthStore((s) => s.user?.avatar_url) ?? AVATAR_URL

  // Obtém ou cria conversa ao montar o componente
  useEffect(() => {
    chatApi.listConversations()
      .then(async (data) => {
        let convId: string
        if (data.conversations.length > 0) {
          convId = data.conversations[0].id
        } else {
          const newConv = await chatApi.createConversation()
          convId = newConv.id
        }
        setConversationId(convId)
        return chatApi.getMessages(convId)
      })
      .then((data) => {
        const loaded: Message[] = data.messages.map((m, i) => ({
          id: i + 1,
          type: m.role === "user" ? "user" : "ai",
          text: m.content,
          citations: m.citations ?? [],
        }))
        setMessages(loaded)
      })
      .catch(() => {
        // Back-end não disponível — começa com estado vazio
      })
  }, [])

  // Rola para o fim sempre que mensagens mudam
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || isLoading || !conversationId) return

    setInput("")

    const baseId = Date.now()

    // Adiciona mensagem do usuário e indicador de loading
    setMessages((prev) => [
      ...prev,
      { id: baseId, type: "user", text },
      { id: baseId + 1, type: "ai", text: "", loading: true },
    ])
    setIsLoading(true)

    try {
      const data = await chatApi.sendMessage(conversationId!, text)
      const aiMsg: Message = {
        id: baseId + 2,
        type: "ai",
        text: data.assistant_message.content,
        citations: data.assistant_message.citations ?? [],
      }

      // Substitui o loading pela resposta real
      setMessages((prev) =>
        prev.filter((m) => m.id !== baseId + 1).concat(aiMsg),
      )
    } catch {
      // Substitui o loading por mensagem de erro amigável
      setMessages((prev) =>
        prev.filter((m) => m.id !== baseId + 1).concat({
          id: baseId + 2,
          type: "ai",
          text: "Não foi possível me conectar ao servidor. Verifique se o back-end está rodando em localhost:8000.",
          citations: [],
        }),
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 max-w-2xl mx-auto overflow-hidden">
      {/* Header */}
      <header className="shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-blue-600 rounded-xl hover:bg-blue-50 active:scale-95 transition-all duration-200"
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
            <img src={avatarUrl} alt="Perfil do usuário" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Mensagens */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {/* Boas-vindas */}
        <div className="flex flex-col items-center mb-8 text-center pt-4 animate-slide-up">
          <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-4 shadow-[0_4px_20px_-4px_rgb(37_99_235/0.15)]">
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

        {/* Âncora de scroll */}
        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <div className="shrink-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 pt-3 pb-4">
        <div className="px-4">
          {/* Sugestões */}
          <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-none">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="flex-shrink-0 px-4 py-2 bg-slate-100 text-xs font-medium rounded-full border border-slate-200 hover:border-blue-600/50 hover:text-blue-600 hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-150 active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Campo de input */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-600/20 focus-within:border-blue-600/30 focus-within:bg-white">
            <button
              className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
              aria-label="Adicionar anexo"
            >
              <Plus size={22} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              disabled={isLoading}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 placeholder-slate-400 outline-none disabled:opacity-50"
              placeholder="Digite sua dúvida bíblica..."
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
