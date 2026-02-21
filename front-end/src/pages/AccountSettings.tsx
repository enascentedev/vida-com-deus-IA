import { useState, useEffect, useRef } from "react"
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
  Camera,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { usersApi } from "@/lib/api"
import type { UserSettings } from "@/lib/api"
import { useAuthStore } from "@/store/useAuthStore"
import { useTheme } from "@/hooks/useTheme"
import { Skeleton } from "vida-com-deus-ui"
import { SecondaryTopbar } from "@/components/layout/SecondaryTopbar"

// Avatar padrão: silhueta genérica sem rosto humano
const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e2e8f0'/%3E%3Ccircle cx='50' cy='38' r='18' fill='%2394a3b8'/%3E%3Cellipse cx='50' cy='90' rx='32' ry='24' fill='%2394a3b8'/%3E%3C/svg%3E"

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
          className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-200 active:scale-95 ${
            value === opt.id
              ? "bg-white shadow-sm border border-slate-200 text-blue-600"
              : "text-slate-400 hover:bg-white/50 hover:text-slate-600"
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
      className={`flex items-center gap-4 px-4 min-h-16 w-full justify-between hover:bg-slate-100 active:bg-slate-100/80 transition-all duration-150 text-left ${
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

// Apenas as chaves booleanas de UserSettings (theme é string, não boolean)
type BooleanSettingKey = "ai_insights" | "biblical_reminders" | "rag_memory"

/* -------------------------------------------------------------------------- */
/*  Página AccountSettings                                                     */
/* -------------------------------------------------------------------------- */
export function AccountSettings() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const { theme, setTheme } = useTheme()
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Carrega configurações do servidor ao montar o componente
  useEffect(() => {
    let cancelled = false
    usersApi.getSettings()
      .then((data) => { if (!cancelled) setSettings(data) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  // Auto-save em cada toggle com reversão em caso de erro
  async function handleToggle(key: BooleanSettingKey, value: boolean) {
    setSettings((prev) => prev ? { ...prev, [key]: value } : prev)
    try {
      await usersApi.patchSettings({ [key]: value })
    } catch {
      // Reverte o toggle em caso de erro
      setSettings((prev) => prev ? { ...prev, [key]: !value } : prev)
    }
  }

  function handlePhotoClick() {
    fileInputRef.current?.click()
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingPhoto(true)
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result as string
      try {
        const updated = await usersApi.patchMe({ avatar_url: base64 })
        setUser(updated)
      } catch {
        // Silencioso — mantém foto anterior
      } finally {
        setIsUploadingPhoto(false)
      }
    }
    reader.readAsDataURL(file)
    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = ""
  }

  function handleThemeChange(t: Theme) {
    setTheme(t)
    usersApi.patchSettings({ theme: t }).catch(() => {})
  }

  async function handleLogout() {
    await logout()
    navigate("/login")
  }

  const avatarUrl = user?.avatar_url ?? DEFAULT_AVATAR

  return (
    <div className="flex min-h-screen flex-col bg-white max-w-[430px] mx-auto shadow-xl">
      <SecondaryTopbar title="Configurações" />

      <main className="flex-1 overflow-y-auto pb-10">
        {/* Perfil */}
        <div className="flex flex-col items-center gap-4 p-6 animate-slide-up">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-[0_4px_24px_-4px_rgb(37_99_235/0.20)] ring-4 ring-blue-600/10 transition-all duration-300 hover:ring-blue-600/20">
              <img src={avatarUrl} alt="Foto de perfil" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
            </div>
            {/* Input de arquivo oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <button
              onClick={handlePhotoClick}
              disabled={isUploadingPhoto}
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow-md border-2 border-white transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-60"
              aria-label="Alterar foto de perfil"
            >
              {isUploadingPhoto ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera size={16} />
              )}
            </button>
          </div>
          <div className="flex flex-col items-center">
            {user === null ? (
              <>
                <Skeleton className="h-6 w-36 mb-2" />
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-5 w-44 mt-2 rounded-full" />
              </>
            ) : (
              <>
                <p className="text-slate-900 text-[22px] font-bold leading-tight">{user.name}</p>
                <p className="text-slate-400 text-sm">{user.email}</p>
                <div className="mt-2 px-3 py-1 bg-blue-600/10 rounded-full">
                  <p className="text-blue-600 text-xs font-semibold uppercase tracking-wider">
                    {user.membership_since
                      ? `Membro desde ${user.membership_since}`
                      : "Membro"}
                  </p>
                </div>
              </>
            )}
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
          <ThemeSelector value={theme} onChange={handleThemeChange} />
        </div>

        {/* IA & Notificações */}
        <Section title="IA & Notificações">
          <SettingItem
            icon={<Sparkles size={20} />}
            title="Insights Diários com IA"
            subtitle="Dicas personalizadas de crescimento espiritual"
            rightSlot={
              <Toggle
                id="ai-insights"
                checked={settings?.ai_insights ?? true}
                onChange={(v) => handleToggle("ai_insights", v)}
              />
            }
          />
          <SettingItem
            icon={<BookOpen size={20} />}
            title="Lembretes Bíblicos"
            subtitle="Versículos ao longo do dia"
            rightSlot={
              <Toggle
                id="biblical-reminders"
                checked={settings?.biblical_reminders ?? true}
                onChange={(v) => handleToggle("biblical_reminders", v)}
              />
            }
          />
          <SettingItem
            icon={<Brain size={20} />}
            title="Memória da IA (RAG)"
            subtitle="Permite que a IA aprenda com as conversas"
            noBorder
            rightSlot={
              <Toggle
                id="ai-memory"
                checked={settings?.rag_memory ?? false}
                onChange={(v) => handleToggle("rag_memory", v)}
              />
            }
          />
        </Section>

        {/* Logout */}
        <div className="px-6 py-8 mt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-4 rounded-2xl font-bold border border-red-100 active:scale-95 transition-all duration-200 hover:bg-red-100 hover:border-red-200 hover:shadow-sm"
          >
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
