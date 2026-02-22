import { useState, useEffect } from "react"
import { RefreshCw, Sparkles, FileText, AlertTriangle, Play } from "lucide-react"
import { adminApi } from "@/lib/api"
import type { StorageMetric, GrowthMetric, ETLRun, SystemAlert, TableStat } from "@/lib/api"
import { timeAgoLocal } from "@/lib/utils"
import { Skeleton } from "vida-com-deus-ui"
import { SecondaryTopbar } from "@/components/layout/SecondaryTopbar"

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Formata bytes (em GB) para exibição legível: MB quando < 100 MB, GB acima. */
function fmtStorage(gb: number): string {
  if (gb < 0.0001) return `${(gb * 1_048_576).toFixed(0)} KB`
  if (gb < 0.1) return `${(gb * 1024).toFixed(1)} MB`
  return `${gb.toFixed(2)} GB`
}

/** Nome do plano Render a partir do total em GB. */
function renderPlanLabel(totalGb: number): string {
  if (totalGb <= 1.1) return "Render · Free (1 GB)"
  if (totalGb <= 11) return "Render · Starter (10 GB)"
  if (totalGb <= 36) return "Render · Standard (35 GB)"
  return `Render · Custom (${totalGb.toFixed(0)} GB)`
}

/** Formata bytes de uma tabela em KB, MB ou GB. */
function fmtTableBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(2)} GB`
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(0)} KB`
  return `${bytes} B`
}

/** Gera caminhos SVG suavizados a partir do histórico de crescimento. */
interface ChartPaths { stroke: string; fill: string }

function buildChartPaths(history: { value_gb: number }[]): ChartPaths {
  if (history.length < 2) return { stroke: "", fill: "" }

  const W = 472, H = 150, PAD = 12
  const values = history.map((d) => d.value_gb)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min

  const pts = history.map((d, i) => ({
    x: (i / (history.length - 1)) * W,
    y: range === 0 ? H / 2 : PAD + ((max - d.value_gb) / range) * (H - PAD * 2),
  }))

  // Bezier cúbico com ponto de controle no meio do segmento X
  let stroke = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], c = pts[i]
    const mx = ((p.x + c.x) / 2).toFixed(1)
    stroke += ` C${mx} ${p.y.toFixed(1)},${mx} ${c.y.toFixed(1)},${c.x.toFixed(1)} ${c.y.toFixed(1)}`
  }

  const last = pts[pts.length - 1]
  return {
    stroke,
    fill: `${stroke} L${last.x.toFixed(1)} ${H} L0 ${H} Z`,
  }
}

/* -------------------------------------------------------------------------- */
/*  Setters agrupados (helper para loadAll)                                    */
/* -------------------------------------------------------------------------- */
type AdminSetters = {
  setStorage: (v: StorageMetric) => void
  setGrowth: (v: GrowthMetric) => void
  setEtlRuns: (v: ETLRun[]) => void
  setAlerts: (v: SystemAlert[]) => void
  setTables: (v: TableStat[]) => void
}

function loadAll(setters: AdminSetters) {
  return Promise.all([
    adminApi.getStorageMetrics(),
    adminApi.getGrowthMetrics(),
    adminApi.getEtlRuns(),
    adminApi.getAlerts(),
    adminApi.getTableMetrics(),
  ]).then(([s, g, r, a, t]) => {
    setters.setStorage(s)
    setters.setGrowth(g)
    setters.setEtlRuns(r.runs)
    setters.setAlerts(a.alerts)
    setters.setTables(t.tables)
  })
}

/* -------------------------------------------------------------------------- */
/*  Card de Capacidade de Armazenamento                                        */
/* -------------------------------------------------------------------------- */
function StorageCard({ storage, isLoading }: { storage: StorageMetric | null; isLoading: boolean }) {
  const usagePercent = storage?.usage_percent ?? 0
  const isWarning = usagePercent >= 70 && usagePercent < 85
  const isCritical = usagePercent >= 85

  const barColor = isCritical ? "bg-red-500" : isWarning ? "bg-orange-500" : "bg-blue-500"
  const percentColor = isCritical ? "text-red-600" : isWarning ? "text-orange-500" : "text-blue-600"
  const alertBadge = isCritical
    ? "bg-red-100 text-red-700"
    : isWarning
    ? "bg-orange-100 text-orange-700"
    : null

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-900 text-lg font-bold leading-tight">Capacidade de Armazenamento</p>
          <p className="text-slate-400 text-sm">
            {storage ? renderPlanLabel(storage.total_gb) : "PostgreSQL · Render"}
          </p>
        </div>
        {alertBadge && (
          <span className={`${alertBadge} px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider`}>
            {isCritical ? "Crítico" : "Alerta"}
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
              <span className={`text-3xl font-bold ${percentColor}`}>{usagePercent}%</span>
              <span className="text-xs text-blue-600/70 font-medium">Utilização Atual</span>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-800 text-sm font-medium">
                {fmtStorage(storage?.used_gb ?? 0)} de {fmtStorage(storage?.total_gb ?? 0)} utilizados
              </span>
              <span className="text-slate-800 text-xs font-mono">{storage?.free_percent ?? 0}% livre</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${barColor} rounded-full transition-all duration-500`}
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
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Card de Histórico de Crescimento                                           */
/* -------------------------------------------------------------------------- */
// Fallback estático para quando ainda não há dados históricos
const STATIC_STROKE =
  "M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
const STATIC_FILL =
  "M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z"

function GrowthHistoryCard({ growth, isLoading }: { growth: GrowthMetric | null; isLoading: boolean }) {
  const history = growth?.history ?? []
  const hasRealData = history.length >= 2

  const { stroke: dynStroke, fill: dynFill } = buildChartPaths(history)
  const chartStroke = hasRealData ? dynStroke : STATIC_STROKE
  const chartFill = hasRealData ? dynFill : STATIC_FILL
  const dayLabels = hasRealData
    ? history.map((d) => d.day)
    : ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-slate-900 text-base font-bold">Histórico de Crescimento (7 dias)</h3>
          {!hasRealData && !isLoading && (
            <p className="text-slate-400 text-xs mt-0.5">Snapshots acumulando — volte amanhã</p>
          )}
        </div>
        <span className="text-green-600 text-xs font-bold">+{growth?.growth_gb ?? "0.000"}GB</span>
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
            >
              <defs>
                <linearGradient
                  id="chart-gradient"
                  x1="236" x2="236" y1="1" y2="149"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#137fec" stopOpacity="0.2" />
                  <stop offset="1" stopColor="#137fec" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={chartFill} fill="url(#chart-gradient)" />
              <path d={chartStroke} stroke="#137fec" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <div className="flex justify-between px-2 mt-2">
              {dayLabels.map((d, i) => (
                <p key={i} className="text-slate-400 text-[10px] font-bold">{d}</p>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Card de Breakdown por Tabela                                               */
/* -------------------------------------------------------------------------- */
function TableBreakdownCard({ tables, isLoading }: { tables: TableStat[]; isLoading: boolean }) {
  const maxBytes = tables[0]?.total_bytes ?? 1

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-slate-900 text-base font-bold">Breakdown por Tabela</h3>
        <p className="text-slate-400 text-xs mt-0.5">Tamanho real via pg_stat_user_tables</p>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : tables.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-4">Nenhuma tabela encontrada</p>
        ) : (
          <div className="space-y-3">
            {tables.map((t) => {
              const barPct = Math.max((t.total_bytes / maxBytes) * 100, 2)
              const indexPct = t.total_bytes > 0 ? (t.index_bytes / t.total_bytes) * 100 : 0
              return (
                <div key={t.table_name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-mono font-medium text-slate-800">{t.table_name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400">
                        {t.rows_estimate.toLocaleString("pt-BR")} linhas
                      </span>
                      <span className="text-xs font-bold text-slate-700 w-16 text-right">
                        {fmtTableBytes(t.total_bytes)}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-600 flex items-stretch"
                      style={{ width: `${barPct}%` }}
                    >
                      {/* Fatia de índice dentro da barra */}
                      <div
                        className="h-full bg-blue-300 rounded-r-full ml-auto"
                        style={{ width: `${indexPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {!isLoading && tables.length > 0 && (
        <div className="px-4 pb-3 pt-2 flex items-center gap-4 border-t border-slate-50">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-sm bg-blue-600" />
            <span className="text-[10px] text-slate-400 font-medium">Dados</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-sm bg-blue-300" />
            <span className="text-[10px] text-slate-400 font-medium">Índices</span>
          </div>
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Card de Ingestão de IA (ETL)                                               */
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
                      <p className="text-[10px] text-slate-400">{timeAgoLocal(run.started_at)}</p>
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
                    {timeAgoLocal(alert.triggered_at)}
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
/*  Página AdminDatabaseMonitor                                                */
/* -------------------------------------------------------------------------- */
export function AdminDatabaseMonitor() {
  const [storage, setStorage] = useState<StorageMetric | null>(null)
  const [growth, setGrowth] = useState<GrowthMetric | null>(null)
  const [etlRuns, setEtlRuns] = useState<ETLRun[]>([])
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [tables, setTables] = useState<TableStat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExecutingEtl, setIsExecutingEtl] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const setters = { setStorage, setGrowth, setEtlRuns, setAlerts, setTables }

  // Carrega ao montar
  useEffect(() => {
    let cancelled = false
    loadAll(setters).finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    const id = setInterval(() => { loadAll(setters).catch(() => {}) }, 5 * 60 * 1000)
    return () => clearInterval(id)
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
        <TableBreakdownCard tables={tables} isLoading={isLoading} />
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
