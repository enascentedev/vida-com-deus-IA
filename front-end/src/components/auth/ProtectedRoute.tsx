import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isInitialized = useAuthStore((s) => s.isInitialized)

  // Aguarda initFromStorage() antes de decidir — evita flash de redirect
  // para /login quando o usuário tem tokens válidos no localStorage
  if (!isInitialized) return null

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
