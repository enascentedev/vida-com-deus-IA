import { LoginForm } from "../components/auth/LoginForm";

export function Login() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50/50 via-slate-50 to-indigo-50/30 px-4 py-10 overflow-hidden">
      {/* Blobs decorativos */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/6 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/5 blur-3xl" />
      <LoginForm />
    </main>
  );
}
