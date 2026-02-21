import { useEffect, useState } from "react"

export type Theme = "light" | "dark" | "system"

const STORAGE_KEY = "vida_deus_theme"

/** Aplica ou remove a classe .dark no elemento raiz do documento. */
function applyTheme(theme: Theme): void {
  const root = document.documentElement
  if (theme === "dark") {
    root.classList.add("dark")
  } else if (theme === "light") {
    root.classList.remove("dark")
  } else {
    // "system" — respeita a preferência do sistema operacional
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    if (prefersDark) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }
}

/**
 * Hook para gerenciar o tema da aplicação.
 * Persiste em localStorage e aplica a classe .dark no <html>.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    const t = (saved as Theme) ?? "system"
    // Aplica imediatamente para evitar flash de tema errado
    applyTheme(t)
    return t
  })

  // Aplica o tema e salva no localStorage a cada mudança
  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  // Escuta mudanças na preferência do sistema quando tema é "system"
  useEffect(() => {
    if (theme !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => applyTheme("system")
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme])

  function setTheme(t: Theme) {
    setThemeState(t)
  }

  return { theme, setTheme }
}
