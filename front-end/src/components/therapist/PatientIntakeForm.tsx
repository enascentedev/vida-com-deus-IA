import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, X, Plus } from "lucide-react"
import { therapistApi } from "@/lib/api"
import type { PatientIntakeForm as IntakeFormData, MoodLevel, AnxietyLevel, DepressionLevel, SleepQuality, ResponseDepth } from "@/lib/api"
import { Input, Button } from "vida-com-deus-ui"

const ANXIETY_OPTIONS: { value: AnxietyLevel; label: string }[] = [
  { value: "none", label: "Nenhuma" },
  { value: "mild", label: "Leve" },
  { value: "moderate", label: "Moderada" },
  { value: "severe", label: "Severa" },
]

const DEPRESSION_OPTIONS: { value: DepressionLevel; label: string }[] = [
  { value: "none", label: "Nenhuma" },
  { value: "mild", label: "Leve" },
  { value: "moderate", label: "Moderada" },
  { value: "severe", label: "Severa" },
]

const SLEEP_OPTIONS: { value: SleepQuality; label: string }[] = [
  { value: "good", label: "Boa" },
  { value: "fair", label: "Regular" },
  { value: "poor", label: "Ruim" },
  { value: "very_poor", label: "Muito Ruim" },
]

const DEPTH_OPTIONS: { value: ResponseDepth; label: string }[] = [
  { value: "brief", label: "Breve" },
  { value: "moderate", label: "Moderada" },
  { value: "detailed", label: "Detalhada" },
]

const MOOD_OPTIONS: { value: MoodLevel; label: string; emoji: string }[] = [
  { value: "very_low", label: "Muito baixo", emoji: "😞" },
  { value: "low", label: "Baixo", emoji: "😔" },
  { value: "neutral", label: "Neutro", emoji: "😐" },
  { value: "good", label: "Bom", emoji: "😊" },
  { value: "great", label: "Ótimo", emoji: "😄" },
]

function PillSelector<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T | undefined
  onChange: (val: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 active:scale-95 ${
            value === opt.value
              ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

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

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-4 space-y-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {children}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-slate-500 mb-1">{children}</label>
}

export function PatientIntakeForm() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [chiefComplaint, setChiefComplaint] = useState("")
  const [anxietyLevel, setAnxietyLevel] = useState<AnxietyLevel | undefined>()
  const [depressionLevel, setDepressionLevel] = useState<DepressionLevel | undefined>()
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | undefined>()
  const [suicidalIdeation, setSuicidalIdeation] = useState(false)
  const [currentMedication, setCurrentMedication] = useState("")
  const [therapyGoal, setTherapyGoal] = useState("")
  const [therapeuticApproach, setTherapeuticApproach] = useState("")
  const [focusTopics, setFocusTopics] = useState<string[]>([])
  const [avoidTopics, setAvoidTopics] = useState<string[]>([])
  const [responseDepth, setResponseDepth] = useState<ResponseDepth>("moderate")
  const [messagesLimit, setMessagesLimit] = useState(100)
  const [firstSessionDate, setFirstSessionDate] = useState("")
  const [firstSessionSummary, setFirstSessionSummary] = useState("")
  const [firstSessionMood, setFirstSessionMood] = useState<MoodLevel | undefined>()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    setIsSubmitting(true)
    setError(null)

    const data: IntakeFormData = {
      name: name.trim(),
      email: email.trim(),
      chief_complaint: chiefComplaint || undefined,
      anxiety_level: anxietyLevel,
      depression_level: depressionLevel,
      sleep_quality: sleepQuality,
      suicidal_ideation: suicidalIdeation,
      current_medication: currentMedication || undefined,
      therapy_goal: therapyGoal || undefined,
      therapeutic_approach: therapeuticApproach || undefined,
      focus_topics: focusTopics.length > 0 ? focusTopics : undefined,
      avoid_topics: avoidTopics.length > 0 ? avoidTopics : undefined,
      response_depth: responseDepth,
      messages_limit: messagesLimit,
      first_session_date: firstSessionDate || undefined,
      first_session_summary: firstSessionSummary || undefined,
      first_session_mood: firstSessionMood,
    }

    try {
      const patient = await therapistApi.createPatient(data)
      navigate(`/gestao/pacientes/${patient.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar paciente")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Topbar */}
      <div className="sticky top-0 z-40 flex items-center bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 pb-2 justify-between">
        <button
          onClick={() => navigate("/gestao/pacientes")}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all duration-200"
          aria-label="Voltar"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          Novo Paciente
        </h2>
        <div className="w-10" />
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Bloco 1 — Identificação */}
        <SectionCard title="Identificação">
          <div className="space-y-3">
            <div>
              <FieldLabel>Nome completo *</FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do paciente"
                required
                className="bg-white border-slate-200"
              />
            </div>
            <div>
              <FieldLabel>Email *</FieldLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                required
                className="bg-white border-slate-200"
              />
            </div>
          </div>
        </SectionCard>

        {/* Bloco 2 — Avaliação Clínica */}
        <SectionCard title="Avaliação Clínica">
          <div className="space-y-4">
            <div>
              <FieldLabel>Queixa principal</FieldLabel>
              <textarea
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Descreva a queixa principal do paciente..."
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 min-h-[80px] resize-y"
              />
            </div>
            <div>
              <FieldLabel>Nível de ansiedade</FieldLabel>
              <PillSelector options={ANXIETY_OPTIONS} value={anxietyLevel} onChange={setAnxietyLevel} />
            </div>
            <div>
              <FieldLabel>Nível de depressão</FieldLabel>
              <PillSelector options={DEPRESSION_OPTIONS} value={depressionLevel} onChange={setDepressionLevel} />
            </div>
            <div>
              <FieldLabel>Qualidade do sono</FieldLabel>
              <PillSelector options={SLEEP_OPTIONS} value={sleepQuality} onChange={setSleepQuality} />
            </div>
            <div>
              <FieldLabel>Ideação suicida</FieldLabel>
              <button
                type="button"
                onClick={() => setSuicidalIdeation(!suicidalIdeation)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                  suicidalIdeation
                    ? "bg-red-100 text-red-700 ring-2 ring-red-300"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <div className={`size-4 rounded border-2 transition-colors ${suicidalIdeation ? "bg-red-500 border-red-500" : "border-slate-300"}`}>
                  {suicidalIdeation && <span className="flex items-center justify-center text-white text-[10px]">✓</span>}
                </div>
                {suicidalIdeation ? "Sim — atenção redobrada" : "Não relatada"}
              </button>
            </div>
            <div>
              <FieldLabel>Medicação atual</FieldLabel>
              <Input
                value={currentMedication}
                onChange={(e) => setCurrentMedication(e.target.value)}
                placeholder="Ex: Sertralina 50mg"
                className="bg-white border-slate-200"
              />
            </div>
          </div>
        </SectionCard>

        {/* Bloco 3 — Diretrizes para IA */}
        <SectionCard title="Diretrizes para IA">
          <div className="space-y-4">
            <div>
              <FieldLabel>Objetivo terapêutico</FieldLabel>
              <textarea
                value={therapyGoal}
                onChange={(e) => setTherapyGoal(e.target.value)}
                placeholder="O que o paciente busca alcançar..."
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 min-h-[60px] resize-y"
              />
            </div>
            <div>
              <FieldLabel>Abordagem terapêutica</FieldLabel>
              <Input
                value={therapeuticApproach}
                onChange={(e) => setTherapeuticApproach(e.target.value)}
                placeholder="Ex: TCC, Humanista, Psicodinâmica"
                className="bg-white border-slate-200"
              />
            </div>
            <div>
              <FieldLabel>Tópicos de foco</FieldLabel>
              <TagInput tags={focusTopics} onChange={setFocusTopics} placeholder="Adicionar tópico + Enter" />
            </div>
            <div>
              <FieldLabel>Tópicos a evitar</FieldLabel>
              <TagInput tags={avoidTopics} onChange={setAvoidTopics} placeholder="Adicionar tópico + Enter" />
            </div>
            <div>
              <FieldLabel>Profundidade das respostas</FieldLabel>
              <PillSelector options={DEPTH_OPTIONS} value={responseDepth} onChange={setResponseDepth} />
            </div>
            <div>
              <FieldLabel>Limite de mensagens: {messagesLimit}</FieldLabel>
              <input
                type="range"
                min={10}
                max={500}
                step={10}
                value={messagesLimit}
                onChange={(e) => setMessagesLimit(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>10</span>
                <span>500</span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Bloco 4 — Primeira Sessão (opcional) */}
        <SectionCard title="Primeira Sessão (opcional)">
          <div className="space-y-4">
            <div>
              <FieldLabel>Data da sessão</FieldLabel>
              <Input
                type="date"
                value={firstSessionDate}
                onChange={(e) => setFirstSessionDate(e.target.value)}
                className="bg-white border-slate-200"
              />
            </div>
            <div>
              <FieldLabel>Resumo</FieldLabel>
              <textarea
                value={firstSessionSummary}
                onChange={(e) => setFirstSessionSummary(e.target.value)}
                placeholder="Resumo da primeira sessão..."
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 min-h-[60px] resize-y"
              />
            </div>
            <div>
              <FieldLabel>Humor do paciente</FieldLabel>
              <div className="flex gap-2">
                {MOOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFirstSessionMood(opt.value)}
                    className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-xs transition-all duration-150 active:scale-95 ${
                      firstSessionMood === opt.value
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
          </div>
        </SectionCard>

        {/* Erro */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Botão de submissão */}
        <Button
          type="submit"
          disabled={isSubmitting || !name.trim() || !email.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl shadow-lg shadow-blue-600/20 transition-all duration-200 disabled:opacity-50"
        >
          {isSubmitting ? "Cadastrando..." : "Cadastrar Paciente"}
        </Button>
      </form>
    </div>
  )
}
