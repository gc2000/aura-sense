import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}))

vi.mock('@/services/firebase', () => ({
  auth: { currentUser: null },
}))

describe('auth service', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('signInWithGoogle', () => {
    it('calls signInWithPopup with google provider', async () => {
      const { signInWithPopup } = await import('firebase/auth')
      vi.mocked(signInWithPopup).mockResolvedValueOnce({ user: { uid: 'u1' } } as never)

      const { signInWithGoogle } = await import('@/services/auth')
      await signInWithGoogle()

      expect(signInWithPopup).toHaveBeenCalled()
    })
  })

  describe('signInWithEmail', () => {
    it('calls signInWithEmailAndPassword', async () => {
      const { signInWithEmailAndPassword } = await import('firebase/auth')
      vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce({ user: { uid: 'u1' } } as never)

      const { signInWithEmail } = await import('@/services/auth')
      await signInWithEmail('test@test.com', 'password')

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@test.com',
        'password'
      )
    })
  })

  describe('registerWithEmail', () => {
    it('creates user and updates display name', async () => {
      const mockUser = { uid: 'u1' }
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth')
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce({ user: mockUser } as never)
      vi.mocked(updateProfile).mockResolvedValueOnce(undefined)

      const { registerWithEmail } = await import('@/services/auth')
      await registerWithEmail('test@test.com', 'password', 'Test User')

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@test.com',
        'password'
      )
      expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'Test User' })
    })
  })

  describe('signOut', () => {
    it('calls Firebase signOut', async () => {
      const { signOut: firebaseSignOut } = await import('firebase/auth')
      vi.mocked(firebaseSignOut).mockResolvedValueOnce(undefined)

      const { signOut } = await import('@/services/auth')
      await signOut()

      expect(firebaseSignOut).toHaveBeenCalled()
    })
  })

  describe('getIdToken', () => {
    it('returns null when no current user', async () => {
      const firebase = await import('@/services/firebase')
      ;(firebase.auth as { currentUser: unknown }).currentUser = null

      const { getIdToken } = await import('@/services/auth')
      const token = await getIdToken()
      expect(token).toBeNull()
    })

    it('returns token from current user', async () => {
      const firebase = await import('@/services/firebase')
      ;(firebase.auth as { currentUser: unknown }).currentUser = {
        getIdToken: vi.fn().mockResolvedValue('mock-jwt-token'),
      }

      const { getIdToken } = await import('@/services/auth')
      const token = await getIdToken()
      expect(token).toBe('mock-jwt-token')
    })
  })
})
