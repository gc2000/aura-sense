import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithGoogle, signInWithEmail, registerWithEmail } from '@/services/auth'
import { useAuth } from '@/context/AuthContext'

const DEMO_EMAIL = 'demo@aura.app'
const DEMO_PASSWORD = 'aura2026'

type Mode = 'signin' | 'register'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password)
      } else {
        await registerWithEmail(email, password, displayName)
      }
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? friendlyError(err.message) : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    setLoading(true)
    try {
      const result = await signInWithGoogle()
      if (result) navigate('/')
    } catch (err) {
      console.error('handleGoogle error:', err)
      setError(err instanceof Error ? friendlyError(err.message) : 'Google sign-in failed')
      setLoading(false)
    }
  }

  async function handleEnterDemo() {
    setError(null)
    setLoading(true)
    try {
      await signInWithEmail(DEMO_EMAIL, DEMO_PASSWORD)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? friendlyError(err.message) : 'Demo sign-in failed')
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

      <div className="flex flex-col items-center flex-1 px-6 pt-6 pb-4 relative z-10">
        {/* Logo + Brand */}
        <div className="flex flex-col items-center mb-6">
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
        <div className="glass-card w-full max-w-sm p-6">
          {/* Demo login */}
          <button
            onClick={handleEnterDemo}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-aura-surface border border-aura-accent/40 text-sm text-aura-accent font-semibold tracking-widest uppercase hover:bg-aura-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? 'Please wait...' : 'Enter Demo'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-aura-border" />
            <span className="text-xs text-aura-text-muted tracking-widest">OR</span>
            <div className="flex-1 h-px bg-aura-border" />
          </div>

          {/* Tab toggle */}
          <div className="flex rounded-lg bg-aura-surface p-1 mb-6">
            {(['signin', 'register'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null) }}
                className={`flex-1 py-2 text-xs font-medium rounded-md tracking-widest uppercase transition-all duration-200 ${
                  mode === m
                    ? 'bg-aura-accent text-white shadow-glow-accent'
                    : 'text-aura-text-dim hover:text-aura-text'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs text-aura-text-dim tracking-widest uppercase mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  className="w-full bg-aura-surface border border-aura-border rounded-xl px-4 py-3 text-sm text-aura-text placeholder-aura-text-muted focus:outline-none focus:border-aura-accent/60 focus:shadow-glow-accent transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-aura-text-dim tracking-widest uppercase mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full bg-aura-surface border border-aura-border rounded-xl px-4 py-3 text-sm text-aura-text placeholder-aura-text-muted focus:outline-none focus:border-aura-accent/60 focus:shadow-glow-accent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs text-aura-text-dim tracking-widest uppercase mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                className="w-full bg-aura-surface border border-aura-border rounded-xl px-4 py-3 text-sm text-aura-text placeholder-aura-text-muted focus:outline-none focus:border-aura-accent/60 focus:shadow-glow-accent transition-all"
              />
            </div>

            {error && (
              <p role="alert" className="text-xs text-aura-red bg-aura-red/10 border border-aura-red/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-aura-accent text-white text-sm font-semibold tracking-widest uppercase shadow-glow-accent disabled:opacity-50 disabled:cursor-not-allowed hover:bg-aura-accent-dim transition-all duration-200 mt-1"
            >
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-aura-border" />
            <span className="text-xs text-aura-text-muted tracking-widest">OR</span>
            <div className="flex-1 h-px bg-aura-border" />
          </div>

          {/* Google sign-in */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            aria-label="Sign in with Google"
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-aura-surface border border-aura-border text-sm text-aura-text hover:border-aura-accent/40 hover:bg-aura-card disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <GoogleIcon />
            Continue with Google
          </button>

        </div>

        <p className="text-xs text-aura-text-muted text-center mt-4 px-4 leading-relaxed">
          Aura assists blind and visually impaired users.{' '}
          <br />
          Not for real-time hazard navigation.
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" />
    </svg>
  )
}

function friendlyError(msg: string): string {
  if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential'))
    return 'Invalid email or password.'
  if (msg.includes('email-already-in-use'))
    return 'An account with this email already exists.'
  if (msg.includes('weak-password'))
    return 'Password must be at least 6 characters.'
  if (msg.includes('invalid-email'))
    return 'Please enter a valid email address.'
  if (msg.includes('popup-closed-by-user'))
    return 'Sign-in cancelled.'
  return 'Something went wrong. Please try again.'
}
