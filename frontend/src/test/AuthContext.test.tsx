import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '@/context/AuthContext'

// Mock firebase modules so tests run without real Firebase credentials
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn(),
}))

vi.mock('@/services/firebase', () => ({
  auth: {},
}))

function UserDisplay() {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading</div>
  return <div>{user ? `Hello ${user.email}` : 'Not signed in'}</div>
}

describe('AuthContext', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows not signed in when user is null', async () => {
    const { onAuthStateChanged } = await import('firebase/auth')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(onAuthStateChanged as any).mockImplementation((_auth: unknown, cb: (u: null) => void) => {
      cb(null)
      return vi.fn()
    })

    render(
      <AuthProvider>
        <UserDisplay />
      </AuthProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('Not signed in')).toBeInTheDocument()
    })
  })

  it('throws when useAuth is used outside AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => render(<UserDisplay />)).toThrow('useAuth must be used inside <AuthProvider>')
    spy.mockRestore()
  })

  it('provides user data when Firebase user is present', async () => {
    const { onAuthStateChanged } = await import('firebase/auth')
    const mockUser = {
      uid: 'user-123',
      email: 'test@aura.app',
      displayName: 'Test User',
      photoURL: null,
      getIdToken: async () => 'mock-token',
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(onAuthStateChanged as any).mockImplementation((_auth: unknown, cb: (u: typeof mockUser) => void) => {
      cb(mockUser)
      return vi.fn()
    })

    render(
      <AuthProvider>
        <UserDisplay />
      </AuthProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('Hello test@aura.app')).toBeInTheDocument()
    })
  })
})
