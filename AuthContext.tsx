import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Create or update user profile in Firestore
        const userRef = doc(db, 'profiles', user.uid)
        const userSnap = await getDoc(userRef)
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            id: user.uid,
            email: user.email,
            fullName: user.displayName || '',
            level: 1,
            totalXp: 0,
            currentPurpose: null,
            createdAt: new Date().toISOString()
          })
        }
      }
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(userCredential.user, {
      displayName: fullName
    })
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'profiles', userCredential.user.uid), {
      id: userCredential.user.uid,
      email: userCredential.user.email,
      fullName: fullName,
      level: 1,
      totalXp: 0,
      currentPurpose: null,
      createdAt: new Date().toISOString()
    })
  }

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}