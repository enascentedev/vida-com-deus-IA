import { create } from "zustand"
import { authApi, usersApi } from "@/lib/api"
import type { UserProfile } from "@/lib/api"

const ACCESS_KEY = "vida_deus_access_token"
const REFRESH_KEY = "vida_deus_refresh_token"

interface AuthState {
  isAuthenticated: boolean
  isInitialized: boolean  // true após initFromStorage() — evita flash de redirect
  user: UserProfile | null
  initFromStorage: () => void
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: UserProfile) => void
  clearAuth: () => void
}

// Zustand v5 com TypeScript exige invocação dupla: create<T>()((set) => ...)
export const useAuthStore = create<AuthState>()((set) => ({
  isAuthenticated: false,
  isInitialized: false,
  user: null,

  // Restaura sessão do localStorage sem chamada à API
  initFromStorage: () => {
    const access = localStorage.getItem(ACCESS_KEY)
    const refresh = localStorage.getItem(REFRESH_KEY)
    if (access && refresh) {
      // Marca como autenticado e inicializado antes do fetch de perfil
      set({ isAuthenticated: true, isInitialized: true })
      // Carrega perfil em segundo plano
      usersApi.getMe().then((user) => set({ user })).catch(() => {})
    } else {
      // Não há tokens — apenas marca como inicializado
      set({ isInitialized: true })
    }
  },

  // Faz login, armazena tokens e carrega perfil
  login: async (email, password) => {
    const pair = await authApi.login(email, password)
    localStorage.setItem(ACCESS_KEY, pair.access_token)
    localStorage.setItem(REFRESH_KEY, pair.refresh_token)
    const user = await usersApi.getMe()
    set({ isAuthenticated: true, user })
  },

  // Cadastra usuário e faz login
  signup: async (name, email, password) => {
    const pair = await authApi.signup(name, email, password)
    localStorage.setItem(ACCESS_KEY, pair.access_token)
    localStorage.setItem(REFRESH_KEY, pair.refresh_token)
    const user = await usersApi.getMe()
    set({ isAuthenticated: true, user })
  },

  // Encerra sessão
  logout: async () => {
    await authApi.logout().catch(() => {}) // fire-and-forget
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    set({ isAuthenticated: false, user: null })
  },

  setUser: (user) => set({ user }),

  clearAuth: () => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    set({ isAuthenticated: false, user: null })
  },
}))

// Escuta evento de logout automático disparado pelo api.ts em falha de refresh
window.addEventListener("auth:logout", () => {
  useAuthStore.getState().clearAuth()
})
