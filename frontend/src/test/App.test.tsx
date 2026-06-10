import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '@/App'

// Mock Firebase so tests run without real credentials
vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({})) }))
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
}))
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn((_auth, cb) => { cb(null); return vi.fn() }),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}))

describe('App', () => {
  it('redirects unauthenticated user to login page', async () => {
    render(<App />)
    // Without a user, ProtectedRoute redirects to /login — Google button is unique on this page
    expect(await screen.findByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
  })
})
