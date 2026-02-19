import { ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface SecondaryTopbarProps {
  title: string
  onBack?: () => void
  rightSlot?: React.ReactNode
}

export function SecondaryTopbar({ title, onBack, rightSlot }: SecondaryTopbarProps) {
  const navigate = useNavigate()

  function handleBack() {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="sticky top-0 z-50 flex items-center bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 pb-2 justify-between">
      <button
        onClick={handleBack}
        className="flex size-10 shrink-0 items-center text-slate-700"
        aria-label="Voltar"
      >
        <ChevronLeft size={24} />
      </button>
      <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center">
        {title}
      </h2>
      <div className="flex w-10 items-center justify-end">
        {rightSlot}
      </div>
    </div>
  )
}
