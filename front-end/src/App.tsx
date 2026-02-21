import "./App.css"
import { useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { LandingPage } from "@/pages/LandingPage"
import { Login } from "@/pages/Login"
import { SignUp } from "@/pages/SignUp"
import { PasswordRecovery } from "@/pages/PasswordRecovery"
import { Home } from "@/pages/Home"
import { PostDetail } from "@/pages/PostDetail"
import { BiblicalAIChat } from "@/pages/BiblicalAIChat"
import { Favorites } from "@/pages/Favorites"
import { AccountSettings } from "@/pages/AccountSettings"
import { AdminDatabaseMonitor } from "@/pages/AdminDatabaseMonitor"
import { TherapistDashboard } from "@/pages/TherapistDashboard"
import { OverviewView } from "@/components/therapist/OverviewView"
import { PatientListView } from "@/components/therapist/PatientListView"
import { PatientIntakeForm } from "@/components/therapist/PatientIntakeForm"
import { PatientDetail } from "@/components/therapist/PatientDetail"

function App() {
  // Restaura sessão do localStorage ao montar o app
  useEffect(() => {
    useAuthStore.getState().initFromStorage()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<SignUp />} />
        <Route path="/recuperar-senha" element={<PasswordRecovery />} />

        {/* Rotas protegidas — exigem autenticação */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/chat" element={<BiblicalAIChat />} />
          <Route path="/biblioteca" element={<Favorites />} />
          <Route path="/configuracoes" element={<AccountSettings />} />
          <Route path="/gestao" element={<TherapistDashboard />}>
            <Route index element={<OverviewView />} />
            <Route path="pacientes" element={<PatientListView />} />
            <Route path="pacientes/:patientId" element={<PatientDetail />} />
            <Route path="intake" element={<PatientIntakeForm />} />
          </Route>
          <Route path="/admin" element={<AdminDatabaseMonitor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
