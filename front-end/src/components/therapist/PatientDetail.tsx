import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ChevronLeft, Save, Plus, Pencil } from "lucide-react"
import { therapistApi } from "@/lib/api"
import type { PatientConfig, PatientStatus, TherapySession, AnxietyLevel, DepressionLevel, SleepQuality, ResponseDepth } from "@/lib/api"
import { formatLocalDateTime } from "@/lib/utils"
import { Badge, Skeleton, Button, Input } from "vida-com-deus-ui"
import { SessionCard } from "./SessionCard"
import { SessionForm } from "./SessionForm"

const STATUS_BADGE: Record<PatientStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Ativo", variant: "default" },
  paused: { label: "Pausado", variant: "secondary" },
  discharged: { label: "Alta", variant: "outline" },
}

const STATUS_OPTIONS: PatientStatus[] = ["active", "paused", "discharged"]

function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

function ProgressBar({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-blue-600"
  return (
    <div className="space-y-1">
      <div className="h-2.5 w-full rounded-full bg-slate-100">
        <div className={`h-2.5 rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-slate-400 text-right tabular-nums">{used} / {limit} mensagens ({Math.round(pct)}%)</p>
    </div>
  )
}

function LabelValue({ label, value }: { label: string; value: string | boolean | null | undefined }) {
  const display = value === true ? "Sim" : value === false ? "Não" : value || "—"
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">{label}</p>
      <p className="text-sm text-slate-700">{typeof display === "string" ? display : String(display)}</p>
    </div>
  )
}

const LEVEL_LABELS: Record<string, string> = {
  none: "Nenhum(a)", mild: "Leve", moderate: "Moderado(a)", severe: "Severo(a)",
  good: "Boa", fair: "Regular", poor: "Ruim", very_poor: "Muito ruim",
  brief: "Breve", moderate_depth: "Moderada", detailed: "Detalhada",
}

export function PatientDetail() {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()

  const [patient, setPatient] = useState<PatientConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [limitDraft, setLimitDraft] = useState(100)
  const [sessionFormOpen, setSessionFormOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<TherapySession | null>(null)

  // Diretrizes editáveis
  const [editingDirectives, setEditingDirectives] = useState(false)
  const [draftGoal, setDraftGoal] = useState("")
  const [draftApproach, setDraftApproach] = useState("")
  const [draftDepth, setDraftDepth] = useState<ResponseDepth>("moderate")

  const loadPatient = useCallback(async () => {
    if (!patientId) return
    try {
      const data = await therapistApi.getPatient(patientId)
      setPatient(data)
      setLimitDraft(data.messages_limit)
      setDraftGoal(data.therapy_goal || "")
      setDraftApproach(data.therapeutic_approach || "")
      setDraftDepth(data.response_depth)
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }, [patientId])

  useEffect(() => { loadPatient() }, [loadPatient])

  async function handleStatusChange(status: PatientStatus) {
    if (!patientId || !patient) return
    setSaving("status")
    try {
      const updated = await therapistApi.updatePatientStatus(patientId, status)
      setPatient(updated)
    } catch { /* ignore */ }
    setSaving(null)
  }

  async function handleLimitSave() {
    if (!patientId) return
    setSaving("limit")
    try {
      const updated = await therapistApi.updatePatientLimit(patientId, limitDraft)
      setPatient(updated)
    } catch { /* ignore */ }
    setSaving(null)
  }

  async function handleDirectivesSave() {
    if (!patientId) return
    setSaving("directives")
    try {
      const updated = await therapistApi.updatePatient(patientId, {
        therapy_goal: draftGoal || undefined,
        therapeutic_approach: draftApproach || undefined,
        response_depth: draftDepth,
      })
      setPatient(updated)
      setEditingDirectives(false)
    } catch { /* ignore */ }
    setSaving(null)
  }

  function handleSessionSaved() {
    setSessionFormOpen(false)
    setEditingSession(null)
    loadPatient()
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 max-w-md mx-auto">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-slate-400">Paciente não encontrado</p>
        <button onClick={() => navigate("/gestao/pacientes")} className="text-blue-600 text-sm mt-2 font-medium">
          Voltar para lista
        </button>
      </div>
    )
  }

  const badge = STATUS_BADGE[patient.status]

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
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center truncate">
          {patient.name}
        </h2>
        <div className="w-10" />
      </div>

      <div className="p-4 space-y-4">
        {/* 1. Header/Status */}
        <SectionCard title="Status">
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_OPTIONS.map((s) => {
              const b = STATUS_BADGE[s]
              return (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={saving === "status"}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-95 ${
                    patient.status === s
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {b.label}
                </button>
              )
            })}
            <Badge variant={badge.variant} className="ml-auto">{badge.label}</Badge>
          </div>
          <p className="text-xs text-slate-400">Início: {formatLocalDateTime(patient.created_at)}</p>
        </SectionCard>

        {/* 2. Controle de Cota */}
        <SectionCard title="Controle de Mensagens">
          <ProgressBar used={patient.messages_used} limit={patient.messages_limit} />
          <div className="space-y-2">
            <label className="text-xs text-slate-500 font-medium">Limite: {limitDraft}</label>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={limitDraft}
              onChange={(e) => setLimitDraft(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>10</span>
              <span>500</span>
            </div>
            {limitDraft !== patient.messages_limit && (
              <Button
                size="sm"
                onClick={handleLimitSave}
                disabled={saving === "limit"}
                className="bg-blue-600 text-white text-xs"
              >
                <Save size={14} className="mr-1" />
                {saving === "limit" ? "Salvando..." : "Salvar limite"}
              </Button>
            )}
          </div>
        </SectionCard>

        {/* 3. Diretrizes para IA */}
        <SectionCard
          title="Diretrizes para IA"
          action={
            !editingDirectives ? (
              <button onClick={() => setEditingDirectives(true)} className="text-blue-600 text-xs font-medium flex items-center gap-1">
                <Pencil size={12} /> Editar
              </button>
            ) : null
          }
        >
          {editingDirectives ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Objetivo</label>
                <textarea
                  value={draftGoal}
                  onChange={(e) => setDraftGoal(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 min-h-[60px] resize-y"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Abordagem</label>
                <Input value={draftApproach} onChange={(e) => setDraftApproach(e.target.value)} className="bg-white border-slate-200" />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Profundidade</label>
                <div className="flex gap-2">
                  {(["brief", "moderate", "detailed"] as ResponseDepth[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDraftDepth(d)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        draftDepth === d ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {d === "brief" ? "Breve" : d === "moderate" ? "Moderada" : "Detalhada"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleDirectivesSave} disabled={saving === "directives"} className="bg-blue-600 text-white text-xs">
                  <Save size={14} className="mr-1" />
                  {saving === "directives" ? "Salvando..." : "Salvar"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingDirectives(false)} className="text-xs">
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <LabelValue label="Objetivo" value={patient.therapy_goal} />
              <LabelValue label="Abordagem" value={patient.therapeutic_approach} />
              <LabelValue label="Profundidade" value={LEVEL_LABELS[patient.response_depth] || patient.response_depth} />
              <LabelValue label="Tópicos de foco" value={patient.focus_topics.join(", ") || "—"} />
              <LabelValue label="Tópicos a evitar" value={patient.avoid_topics.join(", ") || "—"} />
            </div>
          )}
        </SectionCard>

        {/* 4. Histórico de Sessões */}
        <SectionCard
          title="Sessões Terapêuticas"
          action={
            <button
              onClick={() => { setEditingSession(null); setSessionFormOpen(true) }}
              className="text-blue-600 text-xs font-medium flex items-center gap-1"
            >
              <Plus size={12} /> Nova Sessão
            </button>
          }
        >
          {patient.sessions.length > 0 ? (
            <div className="space-y-2">
              {[...patient.sessions].reverse().map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  onEdit={() => { setEditingSession(s); setSessionFormOpen(true) }}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">Nenhuma sessão registrada</p>
          )}
        </SectionCard>

        {/* 5. Avaliação Clínica (leitura) */}
        <SectionCard title="Avaliação Clínica">
          <div className="grid grid-cols-2 gap-3">
            <LabelValue label="Queixa principal" value={patient.chief_complaint} />
            <LabelValue label="Ansiedade" value={patient.anxiety_level ? LEVEL_LABELS[patient.anxiety_level] : null} />
            <LabelValue label="Depressão" value={patient.depression_level ? LEVEL_LABELS[patient.depression_level] : null} />
            <LabelValue label="Sono" value={patient.sleep_quality ? LEVEL_LABELS[patient.sleep_quality] : null} />
            <LabelValue label="Ideação suicida" value={patient.suicidal_ideation} />
            <LabelValue label="Medicação" value={patient.current_medication} />
          </div>
        </SectionCard>
      </div>

      {/* Modal de Sessão */}
      {sessionFormOpen && patientId && (
        <SessionForm
          patientId={patientId}
          session={editingSession}
          onClose={() => { setSessionFormOpen(false); setEditingSession(null) }}
          onSaved={handleSessionSaved}
        />
      )}
    </div>
  )
}
