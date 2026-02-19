import { useState } from "react"
import { Apple, Church, Eye, EyeOff, Chrome } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button, Card, CardContent, CardFooter, CardHeader, Input, Separator } from "vida-com-deus-ui"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  return (
    <Card className="w-full max-w-[420px] rounded-2xl border-slate-200/70 shadow-sm">
      <CardHeader className="items-center space-y-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
          <Church className="h-8 w-8" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Seja bem-vindo</h1>
          <p className="text-sm text-muted-foreground">
            Entre na sua conta para continuar sua jornada espiritual
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="email">
            E-mail
          </label>
          <Input
            id="email"
            type="email"
            placeholder="exemplo@email.com"
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              Senha
            </label>
            <button
              type="button"
              onClick={() => navigate("/recuperar-senha")}
              className="text-sm font-medium text-primary hover:underline"
            >
              Esqueceu a senha?
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Sua senha"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button className="w-full text-base" onClick={() => navigate("/")}>Entrar</Button>
        <div className="relative py-2">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-[11px] font-medium tracking-widest text-muted-foreground">
            OU CONTINUE COM
          </span>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 gap-2">
            <Chrome className="h-4 w-4" />
            Google
          </Button>
          <Button variant="outline" className="flex-1 gap-2">
            <Apple className="h-4 w-4" />
            Apple
          </Button>
        </div>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        <span>Não tem uma conta?</span>
        <button
          type="button"
          onClick={() => navigate("/cadastro")}
          className="ml-1 font-medium text-primary hover:underline"
        >
          Criar conta agora
        </button>
      </CardFooter>
    </Card>
  )
}
