import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { api } from '../services/api'
import type { AuthResponse, User } from '../types'

export interface RegisterInput {
  email: string
  password: string
  nombre: string
  primerApellido: string
  segundoApellido?: string
  fechaNacimiento?: string
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }

    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string): Promise<void> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
    localStorage.setItem('access_token', data.session.access_token)
    localStorage.setItem('refresh_token', data.session.refresh_token)
    setUser(data.user)
  }

  async function register(input: RegisterInput): Promise<void> {
    const { data } = await api.post<AuthResponse>('/auth/register', input)
    localStorage.setItem('access_token', data.session.access_token)
    localStorage.setItem('refresh_token', data.session.refresh_token)
    setUser(data.user)
  }

  function logout(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
