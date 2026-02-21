import { useState } from "react"
import { Eye, EyeOff, Sparkles, Apple, Chrome } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { Button, Input } from "vida-com-deus-ui"
import { SecondaryTopbar } from "@/components/layout/SecondaryTopbar"

/* -------------------------------------------------------------------------- */
/*  Formulário de Cadastro                                                     */
/* -------------------------------------------------------------------------- */
function SignUpForm() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError("As senhas não coincidem.")
      return
    }
    if (!agreedToTerms) {
      setError("Você precisa aceitar os termos para continuar.")
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      await useAuthStore.getState().signup(name, email, password)
      navigate("/")
    } catch {
      setError("Não foi possível criar a conta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="px-4 py-6 flex flex-col items-center animate-slide-up">
      {/* Ícone */}
      <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 hover:scale-105">
        <Sparkles size={32} className="text-blue-600" />
      </div>

      {/* Headline */}
      <h1 className="text-slate-900 text-[32px] font-bold leading-tight text-center pb-2">
        Junte-se ao Vida com Deus
      </h1>
      <p className="text-slate-500 text-sm font-normal leading-normal pb-8 text-center max-w-[300px]">
        Inicie sua jornada espiritual com insights de IA e conexões bíblicas profundas.
      </p>

      <form className="w-full space-y-1" onSubmit={handleSubmit}>
        {/* Nome Completo */}
        <div className="flex flex-col py-3">
          <label className="text-slate-900 text-base font-medium pb-2" htmlFor="nome">
            Nome Completo
          </label>
          <Input
            id="nome"
            type="text"
            placeholder="Digite seu nome"
            className="h-14"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* E-mail */}
        <div className="flex flex-col py-3">
          <label className="text-slate-900 text-base font-medium pb-2" htmlFor="email">
            E-mail
          </label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            className="h-14"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Senha */}
        <div className="flex flex-col py-3">
          <label className="text-slate-900 text-base font-medium pb-2" htmlFor="senha">
            Senha
          </label>
          <div className="relative">
            <Input
              id="senha"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              className="h-14 pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Confirmar Senha */}
        <div className="flex flex-col py-3">
          <label className="text-slate-900 text-base font-medium pb-2" htmlFor="confirmar">
            Confirmar Senha
          </label>
          <div className="relative">
            <Input
              id="confirmar"
              type={showConfirm ? "text" : "password"}
              placeholder="Repita sua senha"
              className="h-14 pr-12"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Termos */}
        <div className="flex items-start gap-3 px-1 py-4">
          <input
            id="terms"
            type="checkbox"
            className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
          />
          <label htmlFor="terms" className="text-sm text-slate-500 leading-snug">
            Eu concordo com os{" "}
            <a href="#" className="text-blue-600 font-medium underline">
              Termos de Uso
            </a>{" "}
            e a{" "}
            <a href="#" className="text-blue-600 font-medium underline">
              Política de Privacidade
            </a>
            .
          </label>
        </div>

        {/* Mensagem de erro */}
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        {/* Botão CTA */}
        <div className="pt-4 pb-6">
          <Button
            type="submit"
            className="w-full h-14 rounded-xl text-base font-bold active:scale-[0.98] transition-all duration-200 shadow-[0_4px_20px_-4px_rgb(37_99_235/0.30)]"
            disabled={isLoading}
          >
            {isLoading ? "Criando conta..." : "Criar minha conta"}
          </Button>
        </div>
      </form>

      {/* Divisor Social */}
      <div className="w-full flex items-center gap-4 py-4">
        <div className="h-px bg-slate-200 flex-1" />
        <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
          ou continue com
        </span>
        <div className="h-px bg-slate-200 flex-1" />
      </div>

      {/* Botões Sociais */}
      <div className="w-full flex gap-4 py-4">
        <Button variant="outline" className="flex-1 gap-2 py-3 hover:border-blue-600/30 hover:bg-blue-50/50 transition-all duration-200 active:scale-[0.98]">
          <Chrome size={20} />
          Google
        </Button>
        <Button variant="outline" className="flex-1 gap-2 py-3 hover:border-blue-600/30 hover:bg-blue-50/50 transition-all duration-200 active:scale-[0.98]">
          <Apple size={20} />
          Apple
        </Button>
      </div>

      {/* Link de Login */}
      <p className="text-center text-sm text-slate-500 py-8">
        Já possui uma conta?{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-blue-600 font-bold ml-1"
        >
          Entrar agora
        </button>
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Página SignUp                                                               */
/* -------------------------------------------------------------------------- */
export function SignUp() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-slate-50 max-w-[480px] mx-auto">
      <SecondaryTopbar title="Criar Conta" />
      <main className="flex-1 overflow-y-auto">
        <SignUpForm />
      </main>
    </div>
  )
}
