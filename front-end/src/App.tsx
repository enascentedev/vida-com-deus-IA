import "./App.css"
import { BrowserRouter, Routes, Route } from "react-router-dom"
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pública */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<SignUp />} />
        <Route path="/recuperar-senha" element={<PasswordRecovery />} />

        {/* App autenticado */}
        <Route path="/" element={<Home />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/chat" element={<BiblicalAIChat />} />
        <Route path="/biblioteca" element={<Favorites />} />
        <Route path="/configuracoes" element={<AccountSettings />} />
        <Route path="/admin" element={<AdminDatabaseMonitor />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
