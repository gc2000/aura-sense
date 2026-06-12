import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmail } from '@/services/auth'
import { useAuth } from '@/context/AuthContext'

const DEMO_EMAIL = 'demo@aura.app'
const DEMO_PASSWORD = 'aura2026'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  async function handleEnterDemo() {
    setError(null)
    setLoading(true)
    try {
      await signInWithEmail(DEMO_EMAIL, DEMO_PASSWORD)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-aura-bg text-aura-text overflow-y-auto">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-aura-accent/5 blur-3xl animate-breathe" />
      </div>

      <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 relative z-10">
        {/* Logo + Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-full bg-aura-accent/20 border border-aura-accent/40 flex items-center justify-center animate-pulse-glow">
              <span className="text-2xl font-bold text-aura-accent tracking-widest">A</span>
            </div>
            <div className="absolute inset-0 rounded-full border border-aura-accent/20 animate-[pulseRing_2s_ease-out_infinite]" />
            <div className="absolute inset-0 rounded-full border border-aura-accent/10 animate-[pulseRing_2s_ease-out_infinite_1s]" />
          </div>
          <h1 className="text-2xl font-semibold tracking-widest uppercase text-aura-text">Aura</h1>
          <p className="text-xs text-aura-text-muted tracking-[0.2em] uppercase mt-1">
            Visual Assistant
          </p>
        </div>

        {/* Card */}
        <div className="glass-card w-full max-w-sm p-8 flex flex-col items-center gap-6">
          <p className="text-sm text-aura-text-muted text-center leading-relaxed">
            Your voice and vision AI companion for the visually impaired.
          </p>

          {error && (
            <p role="alert" className="w-full text-xs text-aura-red bg-aura-red/10 border border-aura-red/20 rounded-lg px-3 py-2 text-center">
              {error}
            </p>
          )}

          <button
            onClick={handleEnterDemo}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-aura-accent text-white text-sm font-semibold tracking-widest uppercase shadow-glow-accent disabled:opacity-50 disabled:cursor-not-allowed hover:bg-aura-accent-dim transition-all duration-200"
          >
            {loading ? 'Connecting...' : 'Enter Demo'}
          </button>
        </div>

        <p className="text-xs text-aura-text-muted text-center mt-8 px-4 leading-relaxed">
          Aura assists blind and visually impaired users.
          <br />
          Not for real-time hazard navigation.
        </p>
      </div>
    </div>
  )
}
