import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'

export interface UserProfile {
  id: string
  email: string
  fullName: string | null
  level: number
  totalXp: number
  currentPurpose: string | null
  createdAt: string
}

// Fibonacci-based XP requirements for each level
const LEVEL_XP_REQUIREMENTS = [
  0,    // Level 1 (starting level)
  50,   // Level 2
  80,   // Level 3  
  130,  // Level 4
  210,  // Level 5
  340,  // Level 6
  550,  // Level 7
  890,  // Level 8
  1440, // Level 9
  2330, // Level 10
  3770, // Level 11
  6100, // Level 12
  9870, // Level 13
  15970, // Level 14
  25840, // Level 15
  41810, // Level 16
  67650, // Level 17
  109460, // Level 18
  177110, // Level 19
  286570, // Level 20
]

// Generate additional levels if needed (up to level 50)
for (let i = LEVEL_XP_REQUIREMENTS.length; i < 50; i++) {
  const prev1 = LEVEL_XP_REQUIREMENTS[i - 1]
  const prev2 = LEVEL_XP_REQUIREMENTS[i - 2]
  LEVEL_XP_REQUIREMENTS.push(prev1 + prev2)
}

export function calculateLevel(totalXp: number): number {
  for (let level = LEVEL_XP_REQUIREMENTS.length - 1; level >= 1; level--) {
    if (totalXp >= LEVEL_XP_REQUIREMENTS[level]) {
      return level + 1
    }
  }
  return 1 // Minimum level
}

export function getXpForLevel(level: number): number {
  return LEVEL_XP_REQUIREMENTS[level - 1] || 0
}

export function getXpToNextLevel(totalXp: number, currentLevel: number): number {
  const nextLevelXp = LEVEL_XP_REQUIREMENTS[currentLevel] || LEVEL_XP_REQUIREMENTS[LEVEL_XP_REQUIREMENTS.length - 1]
  return Math.max(0, nextLevelXp - totalXp)
}

export function getCurrentLevelProgress(totalXp: number, currentLevel: number): number {
  const currentLevelXp = getXpForLevel(currentLevel)
  const nextLevelXp = LEVEL_XP_REQUIREMENTS[currentLevel] || LEVEL_XP_REQUIREMENTS[LEVEL_XP_REQUIREMENTS.length - 1]
  const progressXp = totalXp - currentLevelXp
  const levelRange = nextLevelXp - currentLevelXp
  
  if (levelRange <= 0) return 100 // Max level reached
  
  return Math.min(100, Math.max(0, (progressXp / levelRange) * 100))
}

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    const unsubscribe = onSnapshot(
      doc(db, 'profiles', user.uid),
      (doc) => {
        if (doc.exists()) {
          const profileData = doc.data() as UserProfile
          // Recalculate level based on current XP and Fibonacci system
          const correctLevel = calculateLevel(profileData.totalXp)
          
          // Update level in Firestore if it's different (migration)
          if (correctLevel !== profileData.level) {
            updateDoc(doc.ref, { level: correctLevel })
            profileData.level = correctLevel
          }
          
          setProfile(profileData)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching profile:', error)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [user])

  const updateXP = async (xpGained: number) => {
    if (!profile || !user) return { newLevel: profile?.level || 1, leveledUp: false }

    const newTotalXP = Math.max(0, profile.totalXp + xpGained)
    const newLevel = calculateLevel(newTotalXP)

    await updateDoc(doc(db, 'profiles', user.uid), {
      totalXp: newTotalXP,
      level: newLevel
    })

    return { newLevel, leveledUp: newLevel > profile.level }
  }

  const deductXP = async (xpToDeduct: number) => {
    if (!profile || !user) return { newLevel: profile?.level || 1, leveledDown: false }

    const newTotalXP = Math.max(0, profile.totalXp - xpToDeduct)
    const newLevel = calculateLevel(newTotalXP)

    await updateDoc(doc(db, 'profiles', user.uid), {
      totalXp: newTotalXP,
      level: newLevel
    })

    return { newLevel, leveledDown: newLevel < profile.level }
  }

  const updatePurpose = async (purpose: string) => {
    if (!user) return

    await updateDoc(doc(db, 'profiles', user.uid), {
      currentPurpose: purpose
    })
  }

  return {
    profile,
    loading,
    updateXP,
    deductXP,
    updatePurpose,
    // Export utility functions for components to use
    calculateLevel,
    getXpForLevel,
    getXpToNextLevel: (totalXp: number, level: number) => getXpToNextLevel(totalXp, level),
    getCurrentLevelProgress: (totalXp: number, level: number) => getCurrentLevelProgress(totalXp, level)
  }
}