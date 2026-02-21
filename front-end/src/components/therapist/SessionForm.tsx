import { useState } from "react"
import { X, Plus } from "lucide-react"
import { therapistApi } from "@/lib/api"
import type { TherapySession, MoodLevel, CreateSessionRequest } from "@/lib/api"
import { Input, Button } from "vida-com-deus-ui"

const MOOD_OPTIONS: { value: MoodLevel; label: string; emoji: string }[] = [
  { value: "very_low", label: "Muito baixo", emoji: "😞" },
  { value: "low", label: "Baixo", emoji: "😔" },
  { value: "neutral", label: "Neutro", emoji: "😐" },
  { value: "good", label: "Bom", emoji: "😊" },
  { value: "great", label: "Ótimo", emoji: "😄" },
]

function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder: string
}) {
  const [input, setInput] = useState("")

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault()
      if (!tags.includes(input.trim())) {
        onChange([...tags, input.trim()])
      }
      setInput("")
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 rounded-md bg-blue-600/10 px-2 py-0.5 text-xs font-medium text-blue-700">
            {tag}
            <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))} className="hover:text-red-500">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-9 text-sm bg-white border-slate-200"
        />
        <button
          type="button"
          onClick={() => {
            if (input.trim() && !tags.includes(input.trim())) {
              onChange([...tags, input.trim()])
              setInput("")
            }
          }}
          className="shrink-0 flex items-center justify-center size-9 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-95 transition-all"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}

export function SessionForm({
  patientId,
  session,
  onClose,
  onSaved,
}: {
  patientId: string
  session: TherapySession | null
  onClose: () => void
  onSaved: () => void
}) {
  const isEditing = !!session

  const [date, setDate] = useState(session?.date || "")
  const [summary, setSummary] = useState(session?.summary || "")
  const [mood, setMood] = useState<MoodLevel>(session?.mood || "neutral")
  const [topicsCovered, setTopicsCovered] = useState<string[]>(session?.topics_covered || [])
  const [homework, setHomework] = useState(session?.homework || "")
  const [nextSessionDate, setNextSessionDate] = useState(session?.next_session_date || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date || !summary) return

    setIsSubmitting(true)
    setError(null)

    const data: CreateSessionRequest = {
      date,
      summary,
      mood,
      topics_covered: topicsCovered,
      homework: homework || undefined,
      next_session_date: nextSessionDate || undefined,
    }

    try {
      if (isEditing && session) {
        await therapistApi.updateSession(patientId, session.id, data)
      } else {
        await therapistApi.createSession(patientId, data)
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar sessão")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            {isEditing ? "Editar Sessão" : "Nova Sessão"}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Data */}
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Data da sessão *</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="bg-white border-slate-200"
            />
          </div>

          {/* Humor */}
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Humor do paciente *</label>
            <div className="flex gap-2">
              {MOOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMood(opt.value)}
                  className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-xs transition-all duration-150 active:scale-95 flex-1 ${
                    mood === opt.value
                      ? "bg-blue-600/10 text-blue-700 ring-2 ring-blue-300"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-lg">{opt.emoji}</span>
                  <span className="font-medium text-[10px]">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Resumo */}
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Resumo da sessão *</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
              placeholder="Descreva os pontos principais da sessão..."
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 min-h-[80px] resize-y"
            />
          </div>

          {/* Temas abordados */}
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Temas abordados</label>
            <TagInput tags={topicsCovered} onChange={setTopicsCovered} placeholder="Adicionar tema + Enter" />
          </div>

          {/* Tarefa de casa */}
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Tarefa para casa</label>
            <textarea
              value={homework}
              onChange={(e) => setHomework(e.target.value)}
              placeholder="Atividade para o paciente entre sessões..."
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 min-h-[60px] resize-y"
            />
          </div>

          {/* Próxima sessão */}
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Próxima sessão</label>
            <Input
              type="date"
              value={nextSessionDate}
              onChange={(e) => setNextSessionDate(e.target.value)}
              className="bg-white border-slate-200"
            />
          </div>

          {/* Erro */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting || !date || !summary}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {isSubmitting ? "Salvando..." : isEditing ? "Salvar Alterações" : "Registrar Sessão"}
          </Button>
        </form>
      </div>
    </div>
  )
}
