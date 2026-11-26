import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'

interface ProtectedRouteProps {
  role?: Role
  children: ReactNode
}

export default function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <p className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
