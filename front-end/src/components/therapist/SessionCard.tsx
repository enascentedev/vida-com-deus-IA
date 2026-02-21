import { Pencil, CalendarDays } from "lucide-react"
import type { TherapySession, MoodLevel } from "@/lib/api"
import { Badge } from "vida-com-deus-ui"

const MOOD_EMOJI: Record<MoodLevel, string> = {
  very_low: "😞",
  low: "😔",
  neutral: "😐",
  good: "😊",
  great: "😄",
}

export function SessionCard({
  session,
  onEdit,
}: {
  session: TherapySession
  onEdit: () => void
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 space-y-2">
      {/* Linha superior: data + humor + editar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-slate-400" />
          <span className="text-xs font-medium text-slate-500">
            {new Date(session.date).toLocaleDateString("pt-BR")}
          </span>
          <span className="text-base" title={session.mood}>{MOOD_EMOJI[session.mood]}</span>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-blue-600 text-[10px] font-medium hover:underline"
        >
          <Pencil size={12} />
          Editar
        </button>
      </div>

      {/* Resumo */}
      <p className="text-sm text-slate-700 line-clamp-2">{session.summary}</p>

      {/* Tags */}
      {session.topics_covered.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {session.topics_covered.map((t) => (
            <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
              {t}
            </Badge>
          ))}
        </div>
      )}

      {/* Tarefa de casa */}
      {session.homework && (
        <p className="text-xs text-slate-400">
          <span className="font-medium text-slate-500">Tarefa:</span> {session.homework}
        </p>
      )}

      {/* Próxima sessão */}
      {session.next_session_date && (
        <p className="text-xs text-slate-400">
          <span className="font-medium text-slate-500">Próxima:</span>{" "}
          {new Date(session.next_session_date).toLocaleDateString("pt-BR")}
        </p>
      )}
    </div>
  )
}
