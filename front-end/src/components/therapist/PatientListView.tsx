import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, User } from "lucide-react"
import { therapistApi } from "@/lib/api"
import type { PatientSummary, PatientStatus } from "@/lib/api"
import { Badge, Skeleton } from "vida-com-deus-ui"

const STATUS_FILTERS: { label: string; value: PatientStatus | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Ativos", value: "active" },
  { label: "Pausados", value: "paused" },
  { label: "Alta", value: "discharged" },
]

const STATUS_BADGE: Record<PatientStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Ativo", variant: "default" },
  paused: { label: "Pausado", variant: "secondary" },
  discharged: { label: "Alta", variant: "outline" },
}

function ProgressBar({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-blue-600"
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-slate-100">
        <div className={`h-1.5 rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-slate-400 font-medium tabular-nums whitespace-nowrap">{used}/{limit} msgs</span>
    </div>
  )
}

function PatientCard({ patient, onClick }: { patient: PatientSummary; onClick: () => void }) {
  const badge = STATUS_BADGE[patient.status]
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 bg-white px-4 py-3 border-b border-slate-100 last:border-0 text-left w-full hover:-translate-y-0.5 hover:shadow-[0_4px_16px_-4px_rgb(37_99_235/0.10)] transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center justify-center size-11 rounded-xl bg-blue-600/10 shrink-0">
        <User size={20} className="text-blue-600" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-900 truncate">{patient.name}</p>
          <Badge variant={badge.variant} className="text-[10px] px-1.5 py-0 h-5 shrink-0">{badge.label}</Badge>
        </div>
        <p className="text-xs text-slate-400 truncate">{patient.email}</p>
        <ProgressBar used={patient.messages_used} limit={patient.messages_limit} />
      </div>
    </button>
  )
}

function CardSkeleton() {
  return (
    <div className="flex items-center gap-3 bg-white px-4 py-3 border-b border-slate-100">
      <Skeleton className="size-11 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
    </div>
  )
}

export function PatientListView() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState<PatientSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<PatientStatus | "all">("all")

  useEffect(() => {
    let cancelled = false
    therapistApi.getPatients()
      .then((res) => { if (!cancelled) setPatients(res.patients) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  const filtered = statusFilter === "all"
    ? patients
    : patients.filter((p) => p.status === statusFilter)

  return (
    <div className="max-w-md mx-auto">
      {/* Header com botão novo paciente */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-base font-semibold text-slate-900">Pacientes</h2>
        <button
          onClick={() => navigate("/gestao/intake")}
          className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition-all duration-150 hover:shadow-md active:scale-95"
        >
          <Plus size={14} />
          Novo Paciente
        </button>
      </div>

      {/* Filtros de status */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`flex h-8 shrink-0 items-center justify-center rounded-lg px-4 text-sm font-medium transition-all duration-150 active:scale-95 ${
              statusFilter === f.value
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                : "bg-slate-200/50 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="mx-4 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filtered.length > 0 ? (
        <div className="mx-4 rounded-2xl overflow-hidden border border-slate-100 shadow-sm animate-slide-up">
          {filtered.map((p) => (
            <PatientCard
              key={p.id}
              patient={p}
              onClick={() => navigate(`/gestao/pacientes/${p.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
          <div className="w-20 h-20 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <User size={36} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum paciente</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Cadastre seu primeiro paciente para começar a acompanhar o progresso terapêutico.
          </p>
          <button
            onClick={() => navigate("/gestao/intake")}
            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-blue-600/20 transition-all duration-200 hover:shadow-xl active:scale-[0.98]"
          >
            Cadastrar Paciente
          </button>
        </div>
      )}
    </div>
  )
}
