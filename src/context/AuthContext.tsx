import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Cashier } from '../types'
import { findCashier } from '../data/cashiers'

const SESSION_KEY = 'kabukiro_session'

interface AuthSession {
  cashier: Cashier
  loginAt: string
}

interface AuthContextValue {
  cashier: Cashier | null
  isAuthenticated: boolean
  login: (name: string, password: string) => { ok: boolean; error?: string }
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

function saveSession(session: AuthSession | null) {
  if (session) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } else {
    sessionStorage.removeItem(SESSION_KEY)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession())

  const login = useCallback((name: string, password: string) => {
    const trimmed = name.trim()
    if (!trimmed || !password) {
      return { ok: false, error: 'Nama kasir dan password wajib diisi.' }
    }
    const cashier = findCashier(trimmed, password)
    if (!cashier) {
      return { ok: false, error: 'Nama kasir atau password salah.' }
    }
    const next: AuthSession = { cashier, loginAt: new Date().toISOString() }
    setSession(next)
    saveSession(next)
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    setSession(null)
    saveSession(null)
  }, [])

  const value = useMemo(
    () => ({
      cashier: session?.cashier ?? null,
      isAuthenticated: !!session,
      login,
      logout,
    }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
