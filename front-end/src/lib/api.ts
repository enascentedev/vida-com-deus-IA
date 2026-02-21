// Configuração da base URL via variável de ambiente
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/v1"

// ── Tipos TypeScript completos ──────────────────────────────────────────────

// Auth
export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: string
}
export interface MessageResponse { message: string }

// Usuário
export interface UserProfile {
  id: string
  name: string
  email: string
  avatar_url: string | null
  membership_since: string | null
  plan: string
}
export interface UserSettings {
  theme: string
  ai_insights: boolean
  biblical_reminders: boolean
  rag_memory: boolean
}
export interface UpdateProfileRequest { name?: string; avatar_url?: string }
export interface UpdateSettingsRequest {
  theme?: string
  ai_insights?: boolean
  biblical_reminders?: boolean
  rag_memory?: boolean
}

// Posts
export interface PostSummary {
  id: string
  title: string
  reference: string
  category: string
  date: string
  thumbnail_url: string | null
  is_new: boolean
  is_starred: boolean
  tags: string[]
}
export interface PostKeyPoint { text: string }
export interface PostDetail {
  id: string
  title: string
  reference: string
  category: string
  date: string
  thumbnail_url: string | null
  verse_content: string
  ai_summary: string
  key_points: PostKeyPoint[]
  tags: string[]
  devotional_meditation: string
  devotional_prayer: string
  audio_url: string | null
  audio_duration: string | null
}
export interface FeedResponse {
  post_of_day: PostSummary
  recent_posts: PostSummary[]
}

// Biblioteca
export interface LibraryItem {
  id: string
  post_id: string
  title: string
  subtitle: string
  type: "post" | "chat"
  saved_at: string
  tags: string[]
}
export interface LibraryResponse { items: LibraryItem[]; total: number }
export interface FavoriteToggleResponse {
  post_id: string
  is_favorited: boolean
  message: string
}

// Admin
export interface StorageMetric {
  used_bytes: number
  total_bytes: number
  used_gb: number
  total_gb: number
  usage_percent: number
  free_percent: number
}
export interface GrowthDay { day: string; value_gb: number }
export interface GrowthMetric {
  percentage: string
  growth_gb: string
  history: GrowthDay[]
}
export interface ETLRun {
  id: string
  name: string
  status: "success" | "failed" | "running" | "pending"
  started_at: string
  duration: string
  error: string | null
}
export interface ETLRunsResponse { runs: ETLRun[] }
export interface ETLExecuteResponse { run_id: string; message: string; status: string }
export interface SystemAlert {
  id: string
  title: string
  subtitle: string
  level: "info" | "warning" | "error" | "critical"
  triggered_at: string
}
export interface AlertsResponse { alerts: SystemAlert[] }

// Therapist
export type MoodLevel = "very_low" | "low" | "neutral" | "good" | "great"
export type AnxietyLevel = "none" | "mild" | "moderate" | "severe"
export type DepressionLevel = "none" | "mild" | "moderate" | "severe"
export type SleepQuality = "good" | "fair" | "poor" | "very_poor"
export type PatientStatus = "active" | "paused" | "discharged"
export type ResponseDepth = "brief" | "moderate" | "detailed"

export interface TherapySession {
  id: string
  patient_id: string
  date: string
  summary: string
  mood: MoodLevel
  topics_covered: string[]
  homework: string | null
  next_session_date: string | null
  created_at: string
}
export interface PatientConfig {
  id: string
  name: string
  email: string
  status: PatientStatus
  created_at: string
  chief_complaint: string | null
  anxiety_level: AnxietyLevel | null
  depression_level: DepressionLevel | null
  sleep_quality: SleepQuality | null
  suicidal_ideation: boolean
  current_medication: string | null
  therapy_goal: string | null
  therapeutic_approach: string | null
  focus_topics: string[]
  avoid_topics: string[]
  response_depth: ResponseDepth
  messages_used: number
  messages_limit: number
  sessions: TherapySession[]
}
export interface PatientSummary {
  id: string
  name: string
  email: string
  status: PatientStatus
  messages_used: number
  messages_limit: number
  created_at: string
}
export interface PatientIntakeForm {
  name: string
  email: string
  chief_complaint?: string
  anxiety_level?: AnxietyLevel
  depression_level?: DepressionLevel
  sleep_quality?: SleepQuality
  suicidal_ideation?: boolean
  current_medication?: string
  therapy_goal?: string
  therapeutic_approach?: string
  focus_topics?: string[]
  avoid_topics?: string[]
  response_depth?: ResponseDepth
  messages_limit?: number
  first_session_date?: string
  first_session_summary?: string
  first_session_mood?: MoodLevel
}
export interface NearLimitPatient {
  id: string
  name: string
  messages_used: number
  messages_limit: number
}
export interface RecentActivity {
  patient_name: string
  action: string
  timestamp: string
}
export interface DashboardOverview {
  total_patients: number
  active_patients: number
  paused_patients: number
  discharged_patients: number
  near_limit_patients: NearLimitPatient[]
  recent_activity: RecentActivity[]
}
export interface PatientListResponse {
  patients: PatientSummary[]
  total: number
}
export interface UpdatePatientConfigRequest {
  chief_complaint?: string
  anxiety_level?: AnxietyLevel
  depression_level?: DepressionLevel
  sleep_quality?: SleepQuality
  suicidal_ideation?: boolean
  current_medication?: string
  therapy_goal?: string
  therapeutic_approach?: string
  focus_topics?: string[]
  avoid_topics?: string[]
  response_depth?: ResponseDepth
}
export interface UpdatePatientStatusRequest {
  status: PatientStatus
}
export interface UpdateMessageLimitRequest {
  messages_limit: number
}
export interface CreateSessionRequest {
  date: string
  summary: string
  mood: MoodLevel
  topics_covered?: string[]
  homework?: string
  next_session_date?: string
}
export interface SessionListResponse {
  sessions: TherapySession[]
  total: number
}

// Chat
export interface Citation {
  reference: string
  book?: string
  chapter?: number
  verse?: string
}
export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  citations: Citation[]
  created_at: string
}
export interface MessagesResponse {
  conversation_id: string
  messages: ChatMessage[]
}
export interface SendMessageRequest { content: string }
export interface SendMessageResponse {
  user_message: ChatMessage
  assistant_message: ChatMessage
}

// ── Erro tipado da API ───────────────────────────────────────────────────────
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = "ApiError"
  }
}

// Flag para evitar loop de refresh
let _isRefreshing = false

// Fetch wrapper interno com injeção de token e retry de 401
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("vida_deus_access_token")
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  // Tenta refresh automático em 401
  if (res.status === 401 && !_isRefreshing) {
    const refreshToken = localStorage.getItem("vida_deus_refresh_token")
    if (refreshToken) {
      _isRefreshing = true
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        })
        if (refreshRes.ok) {
          const pair = await refreshRes.json()
          localStorage.setItem("vida_deus_access_token", pair.access_token)
          localStorage.setItem("vida_deus_refresh_token", pair.refresh_token)
          _isRefreshing = false
          // Repete a requisição original com novo token
          return apiFetch<T>(path, options)
        }
      } catch {
        // Refresh falhou
      }
      _isRefreshing = false
      // Dispara evento para limpar sessão
      window.dispatchEvent(new CustomEvent("auth:logout"))
      throw new ApiError(401, "Sessão expirada. Faça login novamente.")
    }
  }

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText)
    throw new ApiError(res.status, msg)
  }

  // 204 No Content não tem body
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<TokenPair>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  signup: (name: string, email: string, password: string) =>
    apiFetch<TokenPair>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  logout: () =>
    apiFetch<MessageResponse>("/auth/logout", { method: "POST" }),
  forgotPassword: (email: string) =>
    apiFetch<MessageResponse>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  refresh: (refreshToken: string) =>
    apiFetch<TokenPair>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),
}

// ── Usuário ──────────────────────────────────────────────────────────────────
export const usersApi = {
  getMe: () => apiFetch<UserProfile>("/users/me"),
  patchMe: (data: UpdateProfileRequest) =>
    apiFetch<UserProfile>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  getSettings: () => apiFetch<UserSettings>("/users/me/settings"),
  patchSettings: (data: UpdateSettingsRequest) =>
    apiFetch<UserSettings>("/users/me/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
}

// ── Posts ────────────────────────────────────────────────────────────────────
export const postsApi = {
  getFeed: () => apiFetch<FeedResponse>("/posts/feed"),
  getPost: (id: string) => apiFetch<PostDetail>(`/posts/${id}`),
}

// ── Biblioteca ───────────────────────────────────────────────────────────────
export const libraryApi = {
  getLibrary: (tab: "favorites" | "history") =>
    apiFetch<LibraryResponse>(`/library?tab=${tab}`),
  addFavorite: (postId: string) =>
    apiFetch<FavoriteToggleResponse>(`/library/favorites/${postId}`, { method: "POST" }),
  removeFavorite: (postId: string) =>
    apiFetch<FavoriteToggleResponse>(`/library/favorites/${postId}`, { method: "DELETE" }),
}

// ── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  getStorageMetrics: () => apiFetch<StorageMetric>("/admin/metrics/storage"),
  getGrowthMetrics: () => apiFetch<GrowthMetric>("/admin/metrics/growth"),
  getEtlRuns: () => apiFetch<ETLRunsResponse>("/admin/etl/runs"),
  executeEtl: () =>
    apiFetch<ETLExecuteResponse>("/admin/etl/runs/execute", { method: "POST" }),
  getAlerts: () => apiFetch<AlertsResponse>("/admin/alerts"),
}

// ── Therapist ─────────────────────────────────────────────────────────────────
export const therapistApi = {
  getOverview: () =>
    apiFetch<DashboardOverview>("/therapist/overview"),
  getPatients: () =>
    apiFetch<PatientListResponse>("/therapist/patients"),
  createPatient: (data: PatientIntakeForm) =>
    apiFetch<PatientConfig>("/therapist/patients", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getPatient: (id: string) =>
    apiFetch<PatientConfig>(`/therapist/patients/${id}`),
  updatePatient: (id: string, data: UpdatePatientConfigRequest) =>
    apiFetch<PatientConfig>(`/therapist/patients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  updatePatientStatus: (id: string, status: PatientStatus) =>
    apiFetch<PatientConfig>(`/therapist/patients/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  updatePatientLimit: (id: string, messagesLimit: number) =>
    apiFetch<PatientConfig>(`/therapist/patients/${id}/limit`, {
      method: "PATCH",
      body: JSON.stringify({ messages_limit: messagesLimit }),
    }),
  getPatientSessions: (id: string) =>
    apiFetch<SessionListResponse>(`/therapist/patients/${id}/sessions`),
  createSession: (patientId: string, data: CreateSessionRequest) =>
    apiFetch<TherapySession>(`/therapist/patients/${patientId}/sessions`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSession: (patientId: string, sessionId: string, data: CreateSessionRequest) =>
    apiFetch<TherapySession>(`/therapist/patients/${patientId}/sessions/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
}

// ── Chat ─────────────────────────────────────────────────────────────────────
const CONV_ID = "conv-001" // Fase 1: conversa mock fixa

export const chatApi = {
  getMessages: () =>
    apiFetch<MessagesResponse>(`/chat/conversations/${CONV_ID}/messages`),
  sendMessage: (content: string) =>
    apiFetch<SendMessageResponse>(`/chat/conversations/${CONV_ID}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
}
