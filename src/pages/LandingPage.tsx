import { BookOpen, Brain, MessageSquare, Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"

/* -------------------------------------------------------------------------- */
/*  Header                                                                     */
/* -------------------------------------------------------------------------- */
function LandingHeader() {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-50 w-full bg-slate-50/80 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles size={24} className="text-blue-600" />
          <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">
            Vida com Deus
          </h2>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="text-blue-600 text-sm font-bold px-3 py-1 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Entrar
        </button>
      </div>
    </header>
  )
}

/* -------------------------------------------------------------------------- */
/*  Seção Hero                                                                 */
/* -------------------------------------------------------------------------- */
function HeroSection() {
  const navigate = useNavigate()
  return (
    <section className="bg-gradient-to-br from-green-50 to-white py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center gap-8 min-h-[500px]">
        <div className="relative w-full max-w-lg aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10">
          <img
            src={HERO_IMAGE}
            alt="Montanhas ao amanhecer, representando paz espiritual"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="flex flex-col gap-4 max-w-[600px]">
          <h1 className="text-slate-900 text-4xl font-black leading-tight tracking-tight">
            Vida com Deus — Seu momento diário de reflexão
          </h1>
          <p className="text-slate-600 text-base font-normal leading-relaxed">
            Sua jornada espiritual potencializada por inteligência artificial.
            Tenha acesso a devocionais personalizados e chat bíblico inteligente.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button
            onClick={() => navigate("/cadastro")}
            className="flex items-center justify-center h-14 rounded-xl bg-blue-600 text-white text-base font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98]"
          >
            Criar Conta
          </button>
          <button
            onClick={() => {
              document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })
            }}
            className="flex items-center justify-center h-14 rounded-xl bg-slate-200 text-slate-900 text-base font-bold hover:bg-slate-300 transition-all active:scale-[0.98]"
          >
            Saiba Mais
          </button>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  Card de Feature                                                            */
/* -------------------------------------------------------------------------- */
interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col items-center text-center group hover:border-blue-500/50 transition-colors">
      <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
        <span className="text-blue-600 group-hover:text-white transition-colors">
          {icon}
        </span>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Seção Como Funciona                                                        */
/* -------------------------------------------------------------------------- */
function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-16 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-blue-600 text-xs font-bold uppercase tracking-[0.2em] block mb-2">
            Processo
          </span>
          <h2 className="text-3xl font-bold text-slate-900">Como funciona</h2>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <FeatureCard
            icon={<BookOpen size={32} />}
            title="Conteúdo Diário"
            description="Receba reflexões e versículos selecionados especificamente para seu momento de vida, todos os dias."
          />
          <FeatureCard
            icon={<Brain size={32} />}
            title="Inteligência Artificial"
            description="Nossa IA analisa contextos teológicos para oferecer insights profundos e personalizados sobre as escrituras."
          />
          <FeatureCard
            icon={<MessageSquare size={32} />}
            title="Chat Bíblico"
            description="Tire suas dúvidas em tempo real com um assistente teológico inteligente baseado no conhecimento bíblico."
          />
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  CTA Banner                                                                 */
/* -------------------------------------------------------------------------- */
function CTASection() {
  const navigate = useNavigate()
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto bg-blue-600 rounded-[2rem] p-10 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-600/40">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <h2 className="text-3xl font-black tracking-tight leading-tight">
            Transforme sua vida espiritual hoje
          </h2>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Acompanhe sua caminhada de fé com o auxílio da tecnologia e da sabedoria eterna.
          </p>
          <button
            onClick={() => navigate("/cadastro")}
            className="w-full max-w-xs h-14 bg-white text-blue-600 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-xl active:scale-[0.98]"
          >
            Criar Conta
          </button>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  Footer                                                                     */
/* -------------------------------------------------------------------------- */
function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-10 items-start">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={20} className="text-blue-600" />
            <h2 className="text-slate-900 text-base font-bold">Vida com Deus</h2>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
            Uma nova forma de se conectar com a espiritualidade através da tecnologia e
            sabedoria bíblica.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-slate-900 text-sm">Institucional</h4>
            <a href="#" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">
              Funcionalidades
            </a>
            <a href="#" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">
              Preços
            </a>
            <a href="#" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">
              Perguntas Frequentes
            </a>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-slate-900 text-sm">Legal</h4>
            <a href="#" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">
              Privacidade
            </a>
            <a href="#" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-xs">
          © 2024 Vida com Deus. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}

/* -------------------------------------------------------------------------- */
/*  Página LandingPage                                                         */
/* -------------------------------------------------------------------------- */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      <HeroSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  )
}
