import { useState, useEffect } from "react"
import { Users, UserCheck, UserX, UserMinus, AlertTriangle, Activity } from "lucide-react"
import { therapistApi } from "@/lib/api"
import type { DashboardOverview } from "@/lib/api"
import { Skeleton } from "vida-com-deus-ui"

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className={`flex items-center justify-center size-10 rounded-xl ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
      </div>
    </div>
  )
}

function ProgressBar({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-blue-600"
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-400 font-medium tabular-nums">{used}/{limit}</span>
    </div>
  )
}

export function OverviewView() {
  const [data, setData] = useState<DashboardOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    therapistApi.getOverview()
      .then((res) => { if (!cancelled) setData(res) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      {/* Contadores */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total" value={data.total_patients} icon={Users} color="bg-blue-600/10 text-blue-600" />
        <StatCard label="Ativos" value={data.active_patients} icon={UserCheck} color="bg-emerald-600/10 text-emerald-600" />
        <StatCard label="Pausados" value={data.paused_patients} icon={UserMinus} color="bg-amber-600/10 text-amber-600" />
        <StatCard label="Alta" value={data.discharged_patients} icon={UserX} color="bg-slate-400/10 text-slate-400" />
      </div>

      {/* Perto do limite */}
      {data.near_limit_patients.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900">Perto do limite</h3>
          </div>
          {data.near_limit_patients.map((p) => (
            <div key={p.id} className="space-y-1">
              <p className="text-sm font-medium text-slate-700">{p.name}</p>
              <ProgressBar used={p.messages_used} limit={p.messages_limit} />
            </div>
          ))}
        </div>
      )}

      {/* Atividade recente */}
      {data.recent_activity.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Atividade recente</h3>
          </div>
          <div className="space-y-2">
            {data.recent_activity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-1">
                <div className="size-2 rounded-full bg-blue-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">
                    <span className="font-medium">{a.patient_name}</span>
                    {" — "}
                    {a.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
