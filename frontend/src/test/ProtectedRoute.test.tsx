import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'

// Centralised mock for useAuth — override per test
const mockUseAuth = vi.fn()
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

function Protected() {
  return <div>Secret content</div>
}
function Login() {
  return <div>Login page</div>
}

function renderWithRouter(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Protected />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('shows loading screen while auth is resolving', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true })
    renderWithRouter()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('redirects unauthenticated users to /login', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })
    renderWithRouter()
    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Secret content')).not.toBeInTheDocument()
  })

  it('renders children for authenticated users', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@aura.app', displayName: null, photoURL: null },
      loading: false,
    })
    renderWithRouter()
    expect(screen.getByText('Secret content')).toBeInTheDocument()
  })
})
