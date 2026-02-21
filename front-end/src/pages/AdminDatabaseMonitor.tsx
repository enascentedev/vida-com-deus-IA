import { useState, useEffect } from "react"
import { RefreshCw, Sparkles, FileText, AlertTriangle, Play } from "lucide-react"
import { adminApi } from "@/lib/api"
import type { StorageMetric, GrowthMetric, ETLRun, SystemAlert } from "@/lib/api"
import { Skeleton } from "vida-com-deus-ui"
import { SecondaryTopbar } from "@/components/layout/SecondaryTopbar"

/* -------------------------------------------------------------------------- */
/*  Utilitário de tempo relativo                                               */
/* -------------------------------------------------------------------------- */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m atrás`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h atrás`
  return `${Math.floor(h / 24)}d atrás`
}

/* -------------------------------------------------------------------------- */
/*  Setters agrupados (helper para loadAll)                                    */
/* -------------------------------------------------------------------------- */
type AdminSetters = {
  setStorage: (v: StorageMetric) => void
  setGrowth: (v: GrowthMetric) => void
  setEtlRuns: (v: ETLRun[]) => void
  setAlerts: (v: SystemAlert[]) => void
}

// Carrega todos os dados em paralelo — definido fora do componente para ser estável
function loadAll(setters: AdminSetters) {
  return Promise.all([
    adminApi.getStorageMetrics(),
    adminApi.getGrowthMetrics(),
    adminApi.getEtlRuns(),
    adminApi.getAlerts(),
  ]).then(([s, g, r, a]) => {
    setters.setStorage(s)
    setters.setGrowth(g)
    setters.setEtlRuns(r.runs)
    setters.setAlerts(a.alerts)
  })
}

/* -------------------------------------------------------------------------- */
/*  Card de Capacidade de Armazenamento                                       */
/* -------------------------------------------------------------------------- */
function StorageCard({ storage, isLoading }: { storage: StorageMetric | null; isLoading: boolean }) {
  const usagePercent = storage?.usage_percent ?? 0
  const showAlert = usagePercent >= 70

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-900 text-lg font-bold leading-tight">Capacidade de Armazenamento</p>
          <p className="text-slate-400 text-sm">Vector & Relational DB</p>
        </div>
        {showAlert && (
          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
            Alerta
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ) : (
        <>
          {/* Indicador visual */}
          <div className="w-full rounded-xl flex items-center justify-center bg-linear-to-r from-blue-600/10 to-blue-600/5 border border-blue-600/10 py-6 mb-4">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-blue-600">{usagePercent}%</span>
              <span className="text-xs text-blue-600/70 font-medium">Utilização Atual</span>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-800 text-sm font-medium">
                {storage?.used_gb?.toFixed(1) ?? "0.0"}GB de {storage?.total_gb?.toFixed(1) ?? "0.0"}GB utilizados
              </span>
              <span className="text-slate-800 text-xs font-mono">{storage?.free_percent ?? 0}% livre</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
              <span>0%</span>
              <span className="text-orange-500">70% (Alerta)</span>
              <span className="text-red-500">85% (Crítico)</span>
              <span>100%</span>
            </div>
          </div>
        </>
      )}

      <button className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm shadow-md shadow-blue-600/20">
        Ver Métricas Detalhadas
      </button>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Card de Histórico de Crescimento                                           */
/* -------------------------------------------------------------------------- */
function GrowthHistoryCard({ growth, isLoading }: { growth: GrowthMetric | null; isLoading: boolean }) {
  // Traço estático do gráfico SVG (Fase 2 usará Recharts com dados dinâmicos)
  const svgPath =
    "M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
  const svgFill =
    "M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z"
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-900 text-base font-bold">Histórico de Crescimento (7 dias)</h3>
        <span className="text-green-600 text-xs font-bold">+{growth?.growth_gb ?? "0.0"}GB</span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-2 mb-2">
            <p className="text-slate-900 text-2xl font-bold leading-tight">
              {growth?.percentage ?? "+0%"}
            </p>
            <p className="text-slate-400 text-xs font-normal">vs semana anterior</p>
          </div>
          <div className="w-full mt-2">
            <svg
              viewBox="0 0 472 150"
              fill="none"
              width="100%"
              height="120"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="chart-gradient"
                  x1="236"
                  x2="236"
                  y1="1"
                  y2="149"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#137fec" stopOpacity="0.2" />
                  <stop offset="1" stopColor="#137fec" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={svgFill} fill="url(#chart-gradient)" />
              <path d={svgPath} stroke="#137fec" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <div className="flex justify-between px-2 mt-2">
              {days.map((d) => (
                <p key={d} className="text-slate-400 text-[10px] font-bold">
                  {d}
                </p>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Card de Ingestão de IA (ETL)                                              */
/* -------------------------------------------------------------------------- */
function ETLCard({
  runs,
  isLoading,
  isExecuting,
  onExecute,
}: {
  runs: ETLRun[]
  isLoading: boolean
  isExecuting: boolean
  onExecute: () => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-slate-100">
        <div>
          <h3 className="text-slate-900 text-base font-bold leading-tight">
            Ingestão de IA (ETL)
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="size-2 rounded-full bg-green-500" />
            <span className="text-xs text-slate-400 font-medium">
              Sistema Idle
            </span>
          </div>
        </div>
        <button
          onClick={onExecute}
          disabled={isExecuting}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-60"
        >
          <Play size={14} className="fill-white" />
          {isExecuting ? "Executando..." : "Executar"}
        </button>
      </div>
      <div className="p-4">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
          Execuções Recentes
        </p>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="space-y-3">
            {runs.map((run) => {
              const isSuccess = run.status === "success"
              const isFailed = run.status === "failed"
              return (
                <div
                  key={run.id}
                  className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-8 rounded-lg flex items-center justify-center ${
                        isFailed ? "bg-red-50" : "bg-slate-100"
                      }`}
                    >
                      {isFailed ? (
                        <AlertTriangle size={18} className="text-red-500" />
                      ) : run.name.toLowerCase().includes("rag") ? (
                        <Sparkles size={18} className="text-blue-600" />
                      ) : (
                        <FileText size={18} className="text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{run.name}</p>
                      <p className="text-[10px] text-slate-400">{timeAgo(run.started_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-[10px] font-bold ${
                        isSuccess ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isSuccess ? "Sucesso" : "Falha"}
                    </p>
                    <p className="text-[10px] text-slate-400">{run.duration}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Tabela de Alertas                                                          */
/* -------------------------------------------------------------------------- */
function AlertsTable({ alerts, isLoading }: { alerts: SystemAlert[]; isLoading: boolean }) {
  const levelColors: Record<string, string> = {
    warning: "text-orange-600",
    info: "text-blue-600",
    error: "text-red-600",
    critical: "text-red-800",
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-slate-900 text-base font-bold">Alertas do Sistema</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-4 py-2 font-bold text-slate-400 text-[10px] uppercase">Alerta</th>
              <th className="px-4 py-2 font-bold text-slate-400 text-[10px] uppercase text-right">
                Hora
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Skeleton className="h-3 w-16 ml-auto" />
                    </td>
                  </tr>
                ))}
              </>
            ) : (
              alerts.map((alert) => (
                <tr key={alert.id}>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className={`font-semibold ${levelColors[alert.level] ?? "text-slate-700"}`}>
                        {alert.title}
                      </span>
                      <span className="text-[10px] text-slate-400">{alert.subtitle}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400 text-xs">
                    {timeAgo(alert.triggered_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Página AdminDatabaseMonitor                                               */
/* -------------------------------------------------------------------------- */
export function AdminDatabaseMonitor() {
  const [storage, setStorage] = useState<StorageMetric | null>(null)
  const [growth, setGrowth] = useState<GrowthMetric | null>(null)
  const [etlRuns, setEtlRuns] = useState<ETLRun[]>([])
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExecutingEtl, setIsExecutingEtl] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const setters = { setStorage, setGrowth, setEtlRuns, setAlerts }

  // Carrega todos os dados ao montar o componente
  useEffect(() => {
    let cancelled = false
    loadAll(setters).finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleExecuteEtl() {
    setIsExecutingEtl(true)
    try {
      await adminApi.executeEtl()
      const data = await adminApi.getEtlRuns()
      setEtlRuns(data.runs)
    } catch { /* erro silencioso */ } finally {
      setIsExecutingEtl(false)
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true)
    await loadAll(setters).catch(() => {})
    setIsRefreshing(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SecondaryTopbar
        title="Database Monitor"
        rightSlot={
          <button
            onClick={handleRefresh}
            className="text-slate-700"
            aria-label="Sincronizar"
          >
            <RefreshCw size={22} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-10">
        <StorageCard storage={storage} isLoading={isLoading} />
        <GrowthHistoryCard growth={growth} isLoading={isLoading} />
        <ETLCard
          runs={etlRuns}
          isLoading={isLoading}
          isExecuting={isExecutingEtl}
          onExecute={handleExecuteEtl}
        />
        <AlertsTable alerts={alerts} isLoading={isLoading} />
      </main>
    </div>
  )
}
