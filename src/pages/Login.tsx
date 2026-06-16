import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { CASHIERS } from '../data/cashiers'

export function Login() {
  const { login, isAuthenticated } = useAuth()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = login(name, password)
    if (!result.ok) {
      setError(result.error ?? 'Login gagal.')
      setLoading(false)
    }
  }

  const selectCashier = (cashierName: string) => {
    setName(cashierName)
    setError('')
  }

  return (
    <div className="flex min-h-screen min-h-dvh flex-col bg-[#f8f7fc]">
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-200/30 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md animate-fade-in">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-bold text-white shadow-xl shadow-brand-500/30">
              屋
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Kabukiro POS</h1>
            <p className="mt-1 text-sm text-brand-600">Japanese Yatai</p>
            <p className="mt-3 text-sm text-gray-500">Masuk sebagai kasir untuk melanjutkan</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-brand-500/5 sm:p-8">
            <div className="mb-6 grid grid-cols-2 gap-3">
              {CASHIERS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectCashier(c.name)}
                  className={`rounded-xl border p-3 text-left transition ${
                    name === c.name
                      ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                      : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                      {c.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{c.name}</p>
                      <p className="text-[10px] text-gray-400">Kasir</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  Nama Kasir
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Pilih atau ketik nama kasir"
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-12 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:from-brand-700 hover:to-brand-800 disabled:opacity-60"
              >
                {loading ? 'Memproses...' : 'Masuk ke Aplikasi'}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Kabukiro Japanese Yatai · Point of Sale System
          </p>
        </div>
      </div>
    </div>
  )
}
