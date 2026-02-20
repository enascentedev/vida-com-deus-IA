import { useState } from "react"
import { KeyRound, Mail, Check, RefreshCw } from "lucide-react"
import { Button, Input } from "vida-com-deus-ui"
import { SecondaryTopbar } from "@/components/layout/SecondaryTopbar"

/* -------------------------------------------------------------------------- */
/*  Banner de Sucesso                                                          */
/* -------------------------------------------------------------------------- */
function SuccessBanner({ onResend }: { onResend: () => void }) {
  return (
    <div className="mt-8 px-4 w-full animate-slide-up">
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
        <div className="bg-green-500 rounded-full p-1 text-white shrink-0">
          <Check size={18} />
        </div>
        <div className="flex-1">
          <p className="text-green-800 text-sm font-semibold mb-1">
            E-mail enviado com sucesso
          </p>
          <p className="text-green-700 text-sm leading-tight">
            Verifique sua caixa de entrada! Se a conta existir, você receberá as
            instruções de redefinição em breve.
          </p>
          <button
            type="button"
            onClick={onResend}
            className="mt-3 text-sm font-bold text-green-800 flex items-center gap-1 hover:underline"
          >
            Não recebeu? Reenviar
            <RefreshCw size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Página PasswordRecovery                                                    */
/* -------------------------------------------------------------------------- */
export function PasswordRecovery() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-slate-50">
      <SecondaryTopbar title="Recuperar Senha" />

      <div className="flex-1 flex flex-col items-center pt-8 max-w-md mx-auto w-full px-4 animate-slide-up">
        {/* Ícone */}
        <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mb-6 transition-transform duration-300 hover:scale-105 shadow-[0_4px_24px_-4px_rgb(37_99_235/0.15)]">
          <KeyRound size={40} className="text-blue-600" />
        </div>

        {/* Headline */}
        <h1 className="text-slate-900 text-[32px] font-bold leading-tight text-center pb-3">
          Esqueceu sua senha?
        </h1>

        {/* Descrição */}
        <p className="text-slate-500 text-base font-normal leading-normal pb-8 pt-1 text-center">
          Digite o endereço de e-mail associado à sua conta Vida com Deus e enviaremos
          instruções para redefinir sua senha.
        </p>

        {/* Campo E-mail */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 py-3">
          <label className="flex flex-col w-full">
            <p className="text-slate-900 text-base font-medium leading-normal pb-2">
              Endereço de E-mail
            </p>
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="email"
                placeholder="nome@exemplo.com"
                className="h-14 pl-12"
                required
              />
            </div>
          </label>

          <Button type="submit" className="w-full h-14 rounded-xl text-lg font-bold mt-4 active:scale-[0.98] transition-all duration-200 shadow-[0_4px_20px_-4px_rgb(37_99_235/0.30)]">
            Enviar Instruções
          </Button>
        </form>

        {sent && <SuccessBanner onResend={() => {}} />}

        {/* Rodapé */}
        <div className="mt-auto pb-10 text-center pt-12">
          <p className="text-slate-400 text-sm">
            Precisa de ajuda?{" "}
            <a href="#" className="text-blue-600 font-bold hover:underline">
              Falar com Suporte
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
