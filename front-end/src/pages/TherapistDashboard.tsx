import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { Users, LayoutDashboard } from "lucide-react"
import { BottomNavigation } from "@/components/layout/BottomNavigation"

const NAV_ITEMS = [
  { label: "Visão Geral", path: "/gestao", icon: LayoutDashboard },
  { label: "Pacientes", path: "/gestao/pacientes", icon: Users },
] as const

export function TherapistDashboard() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-slate-900 text-xl font-bold tracking-tight">
            Gestão de Pacientes
          </h1>
        </div>

        {/* Navegação entre sub-rotas */}
        <div className="flex gap-1 px-4 pb-3">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
            const isActive =
              path === "/gestao"
                ? location.pathname === "/gestao"
                : location.pathname.startsWith(path)
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 active:scale-95 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            )
          })}
        </div>
      </header>

      {/* Conteúdo — view filha renderizada pelo React Router */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <BottomNavigation />
    </div>
  )
}
