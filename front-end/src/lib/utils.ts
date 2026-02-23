import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formata data UTC → horário local do browser (ex: "21/02/2026") */
export function formatLocalDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR")
}

/** Formata data+hora UTC → horário local do browser (ex: "21/02/2026, 21:04") */
export function formatLocalDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Formata o campo `date` de um post para exibição no feed.
 * Aceita formato ISO "2026-02-22" e o converte para "22 de fevereiro de 2026".
 * Strings em outro formato (legado) são retornadas sem alteração.
 */
export function fmtPostDate(date: string): string {
  if (!date) return ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-").map(Number)
    return new Date(year, month - 1, day).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }
  return date
}

/** Tempo relativo + data/hora local quando >= 24h (ex: "5m atrás" ou "21/02/2026, 21:04") */
export function timeAgoLocal(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m atrás`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h atrás`
  return formatLocalDateTime(iso)
}
