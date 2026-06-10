import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'
import { auth } from '@/services/firebase'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  idToken: string | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function toUser(fbUser: FirebaseUser): User {
  return {
    id: fbUser.uid,
    email: fbUser.email ?? '',
    displayName: fbUser.displayName,
    photoURL: fbUser.photoURL,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [idToken, setIdToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async fbUser => {
      setFirebaseUser(fbUser)
      if (fbUser) {
        const token = await fbUser.getIdToken()
        setIdToken(token)
      } else {
        setIdToken(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const user = firebaseUser ? toUser(firebaseUser) : null

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, idToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
