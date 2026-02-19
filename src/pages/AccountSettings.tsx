import { useState } from "react"
import {
  User,
  Crown,
  Sparkles,
  BookOpen,
  Brain,
  LogOut,
  Sun,
  Moon,
  Monitor,
  ChevronRight,
} from "lucide-react"
import { SecondaryTopbar } from "@/components/layout/SecondaryTopbar"

const AVATAR_URL =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80"

/* -------------------------------------------------------------------------- */
/*  Seletor de Tema                                                            */
/* -------------------------------------------------------------------------- */
type Theme = "light" | "dark" | "system"

interface ThemeSelectorProps {
  value: Theme
  onChange: (v: Theme) => void
}

function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  const options: { id: Theme; label: string; icon: React.ReactNode }[] = [
    { id: "light", label: "Light", icon: <Sun size={22} /> },
    { id: "dark", label: "Dark", icon: <Moon size={22} /> },
    { id: "system", label: "System", icon: <Monitor size={22} /> },
  ]

  return (
    <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-2xl">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
            value === opt.id
              ? "bg-white shadow-sm border border-slate-200 text-blue-600"
              : "text-slate-400 hover:bg-white/50"
          }`}
        >
          {opt.icon}
          <span className="text-xs font-medium">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Toggle Switch                                                              */
/* -------------------------------------------------------------------------- */
interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  id: string
}

function Toggle({ checked, onChange, id }: ToggleProps) {
  return (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
    </label>
  )
}

/* -------------------------------------------------------------------------- */
/*  Item de Configuração                                                       */
/* -------------------------------------------------------------------------- */
interface SettingItemProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
  rightSlot?: React.ReactNode
  onClick?: () => void
  noBorder?: boolean
}

function SettingItem({ icon, title, subtitle, rightSlot, onClick, noBorder }: SettingItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 px-4 min-h-16 w-full justify-between hover:bg-slate-100 transition-colors text-left ${
        noBorder ? "" : "border-b border-slate-200/50"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center rounded-xl bg-blue-600/10 shrink-0 size-10 text-blue-600">
          {icon}
        </div>
        <div>
          <p className="text-slate-900 text-base font-medium leading-tight">{title}</p>
          {subtitle && <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="shrink-0">
        {rightSlot ?? (
          <ChevronRight size={20} className="text-slate-300" />
        )}
      </div>
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/*  Seção                                                                      */
/* -------------------------------------------------------------------------- */
interface SectionProps {
  title: string
  children: React.ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="mt-6">
      <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider px-6 pb-2">
        {title}
      </h3>
      <div className="mx-4">
        <div className="bg-slate-50 rounded-2xl overflow-hidden">{children}</div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Página AccountSettings                                                     */
/* -------------------------------------------------------------------------- */
export function AccountSettings() {
  const [theme, setTheme] = useState<Theme>("light")
  const [aiInsights, setAiInsights] = useState(true)
  const [biblicalReminders, setBiblicalReminders] = useState(true)
  const [aiMemory, setAiMemory] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-white max-w-[430px] mx-auto shadow-xl">
      <SecondaryTopbar title="Configurações" />

      <main className="flex-1 overflow-y-auto pb-10">
        {/* Perfil */}
        <div className="flex flex-col items-center gap-4 p-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-sm">
              <img src={AVATAR_URL} alt="Foto de perfil" className="w-full h-full object-cover" />
            </div>
            <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow-md border-2 border-white" aria-label="Editar foto de perfil">
              <User size={16} />
            </button>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-slate-900 text-[22px] font-bold leading-tight">Gabriel Santos</p>
            <p className="text-slate-400 text-sm">gabriel.santos@vidacomdeus.com</p>
            <div className="mt-2 px-3 py-1 bg-blue-600/10 rounded-full">
              <p className="text-blue-600 text-xs font-semibold uppercase tracking-wider">
                Membro Espiritual desde 2023
              </p>
            </div>
          </div>
        </div>

        {/* Geral */}
        <Section title="Geral">
          <SettingItem icon={<User size={20} />} title="Informações Pessoais" />
          <SettingItem icon={<Crown size={20} />} title="Acesso Premium" noBorder />
        </Section>

        {/* Aparência */}
        <div className="mt-6 px-6">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider pb-4">
            Aparência
          </h3>
          <ThemeSelector value={theme} onChange={setTheme} />
        </div>

        {/* IA & Notificações */}
        <Section title="IA & Notificações">
          <SettingItem
            icon={<Sparkles size={20} />}
            title="Insights Diários com IA"
            subtitle="Dicas personalizadas de crescimento espiritual"
            rightSlot={
              <Toggle id="ai-insights" checked={aiInsights} onChange={setAiInsights} />
            }
          />
          <SettingItem
            icon={<BookOpen size={20} />}
            title="Lembretes Bíblicos"
            subtitle="Versículos ao longo do dia"
            rightSlot={
              <Toggle
                id="biblical-reminders"
                checked={biblicalReminders}
                onChange={setBiblicalReminders}
              />
            }
          />
          <SettingItem
            icon={<Brain size={20} />}
            title="Memória da IA (RAG)"
            subtitle="Permite que a IA aprenda com as conversas"
            noBorder
            rightSlot={
              <Toggle id="ai-memory" checked={aiMemory} onChange={setAiMemory} />
            }
          />
        </Section>

        {/* Logout */}
        <div className="px-6 py-8 mt-4">
          <button className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-4 rounded-2xl font-bold border border-red-100 active:scale-95 transition-all">
            <LogOut size={20} />
            Sair da Conta
          </button>
          <div className="mt-6 text-center">
            <p className="text-slate-300 text-xs font-medium">Vida com Deus v1.0.0 (Alpha)</p>
            <p className="text-slate-300 text-[10px] mt-1">Desenvolvido para Crescimento Espiritual</p>
          </div>
        </div>
      </main>
    </div>
  )
}
