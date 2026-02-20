import { RefreshCw, Sparkles, FileText, AlertTriangle, Play } from "lucide-react"
import { SecondaryTopbar } from "@/components/layout/SecondaryTopbar"

/* -------------------------------------------------------------------------- */
/*  Tipos                                                                      */
/* -------------------------------------------------------------------------- */
interface ETLRow {
  id: number
  icon: React.ReactNode
  name: string
  time: string
  status: "success" | "failed"
  duration: string
  statusDetail?: string
}

interface AlertRow {
  id: number
  title: string
  subtitle: string
  level: "warning" | "info" | "error"
  time: string
}

/* -------------------------------------------------------------------------- */
/*  Dados mock                                                                 */
/* -------------------------------------------------------------------------- */
const ETL_ROWS: ETLRow[] = [
  {
    id: 1,
    icon: <Sparkles size={18} className="text-blue-600" />,
    name: "Bible RAG Update",
    time: "Hoje, 09:42",
    status: "success",
    duration: "12s",
  },
  {
    id: 2,
    icon: <FileText size={18} className="text-blue-600" />,
    name: "Devotional Sync",
    time: "Ontem, 23:15",
    status: "success",
    duration: "45s",
  },
  {
    id: 3,
    icon: <AlertTriangle size={18} className="text-red-500" />,
    name: "User Insights Batch",
    time: "24 Out, 14:00",
    status: "failed",
    duration: "API Timeout",
  },
]

const ALERT_ROWS: AlertRow[] = [
  {
    id: 1,
    title: "Storage > 70%",
    subtitle: "Capacity threshold reached",
    level: "warning",
    time: "22m atrás",
  },
  {
    id: 2,
    title: "Index Optimized",
    subtitle: "Maintenance cycle complete",
    level: "info",
    time: "4h atrás",
  },
  {
    id: 3,
    title: "Connection Spike",
    subtitle: "RAG service high latency",
    level: "error",
    time: "1d atrás",
  },
]

/* -------------------------------------------------------------------------- */
/*  Card de Capacidade de Armazenamento                                       */
/* -------------------------------------------------------------------------- */
function StorageCard() {
  const usagePercent = 70

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-900 text-lg font-bold leading-tight">Capacidade de Armazenamento</p>
          <p className="text-slate-400 text-sm">Vector & Relational DB</p>
        </div>
        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
          Alerta
        </span>
      </div>

      {/* Indicador visual */}
      <div className="w-full rounded-xl flex items-center justify-center bg-gradient-to-r from-blue-600/10 to-blue-600/5 border border-blue-600/10 py-6 mb-4">
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-blue-600">{usagePercent}%</span>
          <span className="text-xs text-blue-600/70 font-medium">Utilização Atual</span>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-slate-800 text-sm font-medium">1.4GB de 2.0GB utilizados</span>
          <span className="text-slate-800 text-xs font-mono">30% livre</span>
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

      <button className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm shadow-md shadow-blue-600/20">
        Ver Métricas Detalhadas
      </button>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Card de Histórico de Crescimento                                           */
/* -------------------------------------------------------------------------- */
function GrowthHistoryCard() {
  // Pontos do gráfico SVG do design original
  const svgPath =
    "M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
  const svgFill =
    "M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z"
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-900 text-base font-bold">Histórico de Crescimento (7 dias)</h3>
        <span className="text-green-600 text-xs font-bold">+0.2GB</span>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <p className="text-slate-900 text-2xl font-bold leading-tight">+12%</p>
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
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Card de Ingestão de IA (ETL)                                              */
/* -------------------------------------------------------------------------- */
function ETLCard() {
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
              Sistema Idle • Última execução há 2h
            </span>
          </div>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm">
          <Play size={14} className="fill-white" />
          Executar
        </button>
      </div>
      <div className="p-4">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
          Execuções Recentes
        </p>
        <div className="space-y-3">
          {ETL_ROWS.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`size-8 rounded-lg flex items-center justify-center ${
                    row.status === "failed" ? "bg-red-50" : "bg-slate-100"
                  }`}
                >
                  {row.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{row.name}</p>
                  <p className="text-[10px] text-slate-400">{row.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-[10px] font-bold ${
                    row.status === "success" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {row.status === "success" ? "Sucesso" : "Falha"}
                </p>
                <p className="text-[10px] text-slate-400">{row.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Tabela de Alertas                                                          */
/* -------------------------------------------------------------------------- */
function AlertsTable() {
  const levelColors: Record<AlertRow["level"], string> = {
    warning: "text-orange-600",
    info: "text-blue-600",
    error: "text-red-600",
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
            {ALERT_ROWS.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className={`font-semibold ${levelColors[row.level]}`}>
                      {row.title}
                    </span>
                    <span className="text-[10px] text-slate-400">{row.subtitle}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-slate-400 text-xs">{row.time}</td>
              </tr>
            ))}
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
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SecondaryTopbar
        title="Database Monitor"
        rightSlot={
          <button
            className="text-slate-700"
            aria-label="Sincronizar"
          >
            <RefreshCw size={22} />
          </button>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-10">
        <StorageCard />
        <GrowthHistoryCard />
        <ETLCard />
        <AlertsTable />
      </main>
    </div>
  )
}
