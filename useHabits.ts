import { useState, useEffect } from 'react'
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc,
  getDocs,
  updateDoc
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { format, startOfDay, differenceInDays } from 'date-fns'

export interface Habit {
  id: string
  name: string
  description: string | null
  xpReward: number
  color: string
  icon: string
  isActive: boolean
  userId: string
  createdAt: string
}

export interface HabitCompletion {
  id: string
  habitId: string
  userId: string
  completedDate: string
  xpEarned: number
  createdAt: string
}

export interface HabitWithStats extends Habit {
  completedToday: boolean
  currentStreak: number
  totalCompletions: number
  todayCompletionId?: string
}

export function useHabits() {
  const { user } = useAuth()
  const [rawHabits, setRawHabits] = useState<Habit[]>([])
  const [habits, setHabits] = useState<HabitWithStats[]>([])
  const [completions, setCompletions] = useState<HabitCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [habitsLoaded, setHabitsLoaded] = useState(false)
  const [completionsLoaded, setCompletionsLoaded] = useState(false)

  // Subscribe to habits
  useEffect(() => {
    if (!user) {
      setRawHabits([])
      setHabitsLoaded(true)
      return
    }

    const habitsQuery = query(
      collection(db, 'habits'),
      where('userId', '==', user.uid),
      where('isActive', '==', true)
    )

    const unsubscribe = onSnapshot(habitsQuery, (snapshot) => {
      const habitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Habit[]

      // Sort habits by createdAt in memory
      habitsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      setRawHabits(habitsData)
      setHabitsLoaded(true)
    })

    return unsubscribe
  }, [user])

  // Subscribe to completions
  useEffect(() => {
    if (!user) {
      setCompletions([])
      setCompletionsLoaded(true)
      return
    }

    const completionsQuery = query(
      collection(db, 'habitCompletions'),
      where('userId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(completionsQuery, (snapshot) => {
      const completionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HabitCompletion[]

      // Sort completions by completedDate in memory
      completionsData.sort((a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime())
      
      setCompletions(completionsData)
      setCompletionsLoaded(true)
    })

    return unsubscribe
  }, [user])

  // Calculate habits with stats whenever rawHabits or completions change
  useEffect(() => {
    if (!habitsLoaded || !completionsLoaded) {
      return
    }

    const habitsWithStats: HabitWithStats[] = rawHabits.map(habit => {
      const habitCompletions = completions.filter(c => c.habitId === habit.id)
      const today = format(new Date(), 'yyyy-MM-dd')
      const todayCompletion = habitCompletions.find(c => c.completedDate === today)
      const completedToday = !!todayCompletion
      
      // Calculate current streak
      let currentStreak = 0
      const sortedCompletions = habitCompletions
        .map(c => c.completedDate)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

      if (sortedCompletions.length > 0) {
        const today = startOfDay(new Date())
        let checkDate = completedToday ? today : new Date(today.getTime() - 24 * 60 * 60 * 1000)

        for (const completionDate of sortedCompletions) {
          const completion = startOfDay(new Date(completionDate))
          const daysDiff = differenceInDays(checkDate, completion)

          if (daysDiff === 0) {
            currentStreak++
            checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000)
          } else if (daysDiff > 0) {
            break
          }
        }
      }

      return {
        ...habit,
        completedToday,
        currentStreak,
        totalCompletions: habitCompletions.length,
        todayCompletionId: todayCompletion?.id
      }
    })

    setHabits(habitsWithStats)
    setLoading(false)
  }, [rawHabits, completions, habitsLoaded, completionsLoaded])

  const createHabit = async (habitData: {
    name: string
    description?: string
    xpReward?: number
    color?: string
    icon?: string
  }) => {
    if (!user) return { error: new Error('User not authenticated') }

    try {
      await addDoc(collection(db, 'habits'), {
        userId: user.uid,
        name: habitData.name,
        description: habitData.description || null,
        xpReward: habitData.xpReward || 10,
        color: habitData.color || '#6366f1',
        icon: habitData.icon || 'Circle',
        isActive: true,
        createdAt: new Date().toISOString()
      })

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const updateHabit = async (habitId: string, updates: {
    name?: string
    description?: string | null
    xpReward?: number
    color?: string
    icon?: string
  }) => {
    if (!user) return { error: new Error('User not authenticated') }

    try {
      await updateDoc(doc(db, 'habits', habitId), {
        ...updates,
        updatedAt: new Date().toISOString()
      })

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const deleteHabit = async (habitId: string) => {
    if (!user) return { error: new Error('User not authenticated') }

    try {
      // Soft delete by setting isActive to false
      await updateDoc(doc(db, 'habits', habitId), {
        isActive: false,
        deletedAt: new Date().toISOString()
      })

      // Optionally, you could also delete all completions for this habit
      // const completionsToDelete = completions.filter(c => c.habitId === habitId)
      // await Promise.all(completionsToDelete.map(c => deleteDoc(doc(db, 'habitCompletions', c.id))))

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const completeHabit = async (habitId: string, xpReward: number) => {
    if (!user) return { error: new Error('User not authenticated') }

    // Find the current habit state
    const currentHabit = habits.find(h => h.id === habitId)
    if (!currentHabit) {
      return { error: new Error('Habit not found') }
    }

    // Prevent completion if already completed today
    if (currentHabit.completedToday) {
      return { error: new Error('Habit already completed today') }
    }

    const today = format(new Date(), 'yyyy-MM-dd')

    try {
      const docRef = await addDoc(collection(db, 'habitCompletions'), {
        userId: user.uid,
        habitId: habitId,
        completedDate: today,
        xpEarned: xpReward,
        createdAt: new Date().toISOString()
      })

      // Optimistically update local completions state for immediate UI feedback
      const newCompletion: HabitCompletion = {
        id: docRef.id,
        userId: user.uid,
        habitId: habitId,
        completedDate: today,
        xpEarned: xpReward,
        createdAt: new Date().toISOString()
      }

      setCompletions(prev => [newCompletion, ...prev])

      return { error: null, xpEarned: xpReward }
    } catch (error) {
      return { error }
    }
  }

  const uncompleteHabit = async (habitId: string) => {
    if (!user) return { error: new Error('User not authenticated'), xpDeducted: 0 }

    // Find the current habit state
    const currentHabit = habits.find(h => h.id === habitId)
    if (!currentHabit) {
      return { error: new Error('Habit not found'), xpDeducted: 0 }
    }

    // Prevent uncompletion if not completed today
    if (!currentHabit.completedToday || !currentHabit.todayCompletionId) {
      return { error: new Error('Habit not completed today'), xpDeducted: 0 }
    }

    try {
      // Get the XP amount before deleting
      const completion = completions.find(c => c.id === currentHabit.todayCompletionId)
      const xpToDeduct = completion?.xpEarned || 0

      // Delete the completion record
      await deleteDoc(doc(db, 'habitCompletions', currentHabit.todayCompletionId))

      // Optimistically update local completions state for immediate UI feedback
      setCompletions(prev => prev.filter(c => c.id !== currentHabit.todayCompletionId))

      return { error: null, xpDeducted: xpToDeduct }
    } catch (error) {
      return { error, xpDeducted: 0 }
    }
  }

  return {
    habits,
    completions,
    loading,
    createHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    uncompleteHabit
  }
}