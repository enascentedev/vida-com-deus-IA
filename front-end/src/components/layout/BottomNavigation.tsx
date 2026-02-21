import { Home, MessageSquare, Bookmark, ClipboardList, Settings } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

type NavTab = "home" | "chat" | "library" | "gestao" | "admin"

interface NavItemProps {
  icon: React.ReactNode
  iconActive: React.ReactNode
  label: string
  tab: NavTab
  activeTab: NavTab
  onClick: () => void
}

function NavItem({ icon, iconActive, label, tab, activeTab, onClick }: NavItemProps) {
  const isActive = tab === activeTab
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-1 pt-3 pb-2 text-[10px] font-medium transition-all duration-200 relative active:scale-95 ${
        isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
      }`}
    >
      {/* Indicador de aba ativa */}
      {isActive && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-blue-600 animate-slide-down" />
      )}
      <span
        className={`transition-transform duration-200 ${
          isActive ? "scale-110" : "scale-100"
        }`}
      >
        {isActive ? iconActive : icon}
      </span>
      <span>{label}</span>
    </button>
  )
}

const ROUTE_TO_TAB: Record<string, NavTab> = {
  "/": "home",
  "/chat": "chat",
  "/biblioteca": "library",
  "/admin": "admin",
}

function resolveActiveTab(pathname: string): NavTab {
  if (pathname.startsWith("/gestao")) return "gestao"
  return ROUTE_TO_TAB[pathname] ?? "home"
}

export function BottomNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeTab = resolveActiveTab(location.pathname)

  return (
    <nav className="sticky bottom-0 z-50 flex items-center border-t border-slate-100 bg-white/90 backdrop-blur-xl px-2 pb-safe">
      <NavItem
        tab="home"
        activeTab={activeTab}
        label="Início"
        icon={<Home size={22} />}
        iconActive={<Home size={22} className="fill-blue-600 stroke-blue-600" />}
        onClick={() => navigate("/")}
      />
      <NavItem
        tab="chat"
        activeTab={activeTab}
        label="Chat"
        icon={<MessageSquare size={22} />}
        iconActive={<MessageSquare size={22} className="fill-blue-600 stroke-blue-600" />}
        onClick={() => navigate("/chat")}
      />
      <NavItem
        tab="library"
        activeTab={activeTab}
        label="Biblioteca"
        icon={<Bookmark size={22} />}
        iconActive={<Bookmark size={22} className="fill-blue-600 stroke-blue-600" />}
        onClick={() => navigate("/biblioteca")}
      />
      {/* TODO Fase 2: renderização condicional por role (useAuthStore) */}
      <NavItem
        tab="gestao"
        activeTab={activeTab}
        label="Gestão"
        icon={<ClipboardList size={22} />}
        iconActive={<ClipboardList size={22} className="fill-blue-600 stroke-blue-600" />}
        onClick={() => navigate("/gestao")}
      />
      <NavItem
        tab="admin"
        activeTab={activeTab}
        label="Admin"
        icon={<Settings size={22} />}
        iconActive={<Settings size={22} className="text-blue-600" />}
        onClick={() => navigate("/admin")}
      />
    </nav>
  )
}
