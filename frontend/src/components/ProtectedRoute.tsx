import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <AuthLoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

function AuthLoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-aura-bg" role="status" aria-label="Loading">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border border-aura-accent/30 animate-pulse-glow" />
        <div className="absolute inset-0 rounded-full border border-aura-accent/20 animate-[pulseRing_1.5s_ease-out_infinite]" />
      </div>
      <p className="mt-4 text-xs text-aura-text-muted tracking-widest uppercase animate-pulse">
        Connecting...
      </p>
    </div>
  )
}
