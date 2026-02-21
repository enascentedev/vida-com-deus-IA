import { useState, useEffect } from "react"
import { Search, MoreHorizontal, BookOpen, Bot, ChevronRight, Trash2, Plus, ChevronDown } from "lucide-react"
import { libraryApi } from "@/lib/api"
import type { LibraryItem } from "@/lib/api"
import { Skeleton } from "vida-com-deus-ui"
import { BottomNavigation } from "@/components/layout/BottomNavigation"

/* -------------------------------------------------------------------------- */
/*  Tipos                                                                      */
/* -------------------------------------------------------------------------- */
type TabView = "favoritos" | "historico"

/* -------------------------------------------------------------------------- */
/*  Item de Lista                                                              */
/* -------------------------------------------------------------------------- */
function LibraryListItem({ item, onDelete }: { item: LibraryItem; onDelete: (item: LibraryItem) => void }) {
  // Ícone baseado no tipo do item
  const Icon = item.type === "chat" ? Bot : BookOpen

  return (
    <div className="flex items-center gap-4 bg-white px-4 min-h-[88px] py-3 justify-between cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_16px_-4px_rgb(37_99_235/0.10)] transition-all duration-200 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center justify-center rounded-xl bg-blue-600/10 shrink-0 size-12 transition-colors duration-200">
          <Icon size={22} className="text-blue-600" />
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <p className="text-slate-900 text-base font-semibold leading-tight truncate">
            {item.title}
          </p>
          <p className="text-slate-400 text-sm font-normal leading-normal line-clamp-1 mt-0.5">
            {item.subtitle}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onDelete(item)}
          className="p-2 text-slate-300 hover:text-red-500 active:scale-95 transition-all duration-200"
          aria-label="Excluir item"
        >
          <Trash2 size={18} />
        </button>
        <ChevronRight size={20} className="text-slate-300" />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Skeleton de item                                                           */
/* -------------------------------------------------------------------------- */
function ItemSkeleton() {
  return (
    <div className="flex items-center gap-4 bg-white px-4 min-h-[88px] py-3 border-b border-slate-100 last:border-0">
      <Skeleton className="size-12 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Chips de filtro                                                            */
/* -------------------------------------------------------------------------- */
const FILTER_CHIPS = ["Últimos 7 dias", "Chat Bíblico", "Devocionais"]

/* -------------------------------------------------------------------------- */
/*  Página Favorites (Biblioteca)                                              */
/* -------------------------------------------------------------------------- */
export function Favorites() {
  const [activeTab, setActiveTab] = useState<TabView>("favoritos")
  const [items, setItems] = useState<LibraryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  // Carrega itens da biblioteca ao montar e ao trocar de aba
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    const tab = activeTab === "favoritos" ? "favorites" : "history"
    libraryApi.getLibrary(tab)
      .then((data) => { if (!cancelled) setItems(data.items) })
      .catch(() => { if (!cancelled) setItems([]) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [activeTab])

  const filtered = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Delete otimista: remove imediatamente e reverte se a API falhar
  async function handleDelete(item: LibraryItem) {
    setItems((prev) => prev.filter((i) => i.id !== item.id))
    try {
      await libraryApi.removeFavorite(item.post_id)
    } catch {
      setItems((prev) => [...prev, item]) // reverte
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Topbar */}
      <header className="sticky top-0 z-50 bg-slate-50/80 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center p-4 pb-2 justify-between">
          <div className="flex size-10 shrink-0 items-center">
            {/* espaço para alinhar o título no centro */}
          </div>
          <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center">
            Biblioteca
          </h2>
          <div className="flex w-10 items-center justify-end">
            <button
              className="text-slate-700 p-1 rounded-lg hover:bg-slate-100 active:scale-95 transition-all duration-200"
              aria-label="Mais opções"
            >
              <MoreHorizontal size={22} />
            </button>
          </div>
        </div>

        {/* Toggle Tabs */}
        <div className="flex px-4 py-2">
          <div className="flex h-10 flex-1 items-center justify-center rounded-xl bg-slate-200/50 p-1 gap-1">
            {(["favoritos", "historico"] as TabView[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 h-full rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-white shadow-sm text-slate-900"
                    : "text-slate-400"
                }`}
              >
                {tab === "favoritos" ? "Favoritos" : "Histórico"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20 max-w-md mx-auto w-full">
        {/* Barra de Busca */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 rounded-xl bg-slate-200/50 px-3 h-11 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-600/20 focus-within:bg-white">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
              placeholder="Buscar insights ou conversas"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveFilter(null)}
            className={`flex h-8 shrink-0 items-center justify-center gap-1 rounded-lg px-4 transition-all duration-150 active:scale-95 ${
              activeFilter === null ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20" : "bg-slate-200/50 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span className="text-sm font-medium">Todas Tags</span>
            <ChevronDown size={14} />
          </button>
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveFilter(chip === activeFilter ? null : chip)}
              className={`flex h-8 shrink-0 items-center justify-center rounded-lg px-4 transition-all duration-150 active:scale-95 ${
                activeFilter === chip ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20" : "bg-slate-200/50 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <span className="text-sm font-medium">{chip}</span>
            </button>
          ))}
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="flex flex-col mx-4 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
            <ItemSkeleton />
            <ItemSkeleton />
            <ItemSkeleton />
          </div>
        ) : filtered.length > 0 ? (
          <div className="flex flex-col mx-4 rounded-2xl overflow-hidden border border-slate-100 shadow-sm animate-slide-up">
            {filtered.map((item) => (
              <LibraryListItem key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          /* Estado Vazio */
          <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-slate-100 flex items-center justify-center">
              <BookOpen size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Sua jornada começa aqui
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Salve seus insights e conversas favoritas para acessá-los facilmente depois.
            </p>
            <button className="bg-blue-600 text-white font-bold py-3 px-8 rounded-2xl w-full shadow-lg shadow-blue-600/20 transition-all duration-200 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.98]">
              Começar a Explorar
            </button>
          </div>
        )}
      </main>

      {/* FAB */}
      <div className="fixed bottom-20 right-6">
        <button
          className="flex items-center justify-center size-14 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-600/30 transition-all duration-200 hover:shadow-2xl hover:shadow-blue-600/40 hover:scale-110 active:scale-95"
          aria-label="Adicionar novo item"
        >
          <Plus size={24} />
        </button>
      </div>

      <BottomNavigation />
    </div>
  )
}
