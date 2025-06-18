import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Target, Sparkles } from 'lucide-react'
import { useHabits, HabitWithStats } from '../hooks/useHabits'
import { useProfile } from '../hooks/useProfile'
import { HabitCard } from './HabitCard'
import { CreateHabitModal } from './CreateHabitModal'
import { EditHabitModal } from './EditHabitModal'
import toast from 'react-hot-toast'

export function HabitsView() {
  const { habits, loading, completeHabit, uncompleteHabit } = useHabits()
  const { updateXP, deductXP } = useProfile()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<HabitWithStats | null>(null)

  const handleCompleteHabit = async (habitId: string, xpReward: number) => {
    const { error, xpEarned } = await completeHabit(habitId, xpReward)
    
    if (error) {
      toast.error(error.message)
      return
    }

    if (xpEarned) {
      const { newLevel, leveledUp } = await updateXP(xpEarned)
      
      if (leveledUp) {
        toast.success(`🎉 Level up! You're now level ${newLevel}!`, {
          duration: 4000,
        })
      } else {
        toast.success(`+${xpEarned} XP earned! 🌟`)
      }
    }
  }

  const handleUncompleteHabit = async (habitId: string) => {
    const { error, xpDeducted } = await uncompleteHabit(habitId)
    
    if (error) {
      toast.error(error.message)
      return
    }

    if (xpDeducted > 0) {
      const { newLevel, leveledDown } = await deductXP(xpDeducted)
      
      if (leveledDown) {
        toast.error(`📉 Level down! You're now level ${newLevel}`, {
          duration: 4000,
        })
      } else {
        toast.success(`-${xpDeducted} XP deducted`)
      }
    } else {
      toast.success('Habit unmarked')
    }
  }

  const handleEditHabit = (habit: HabitWithStats) => {
    setEditingHabit(habit)
    setShowEditModal(true)
  }

  const handleDeleteHabit = (habit: HabitWithStats) => {
    setEditingHabit(habit)
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingHabit(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Your Habits
          </h1>
          <p className="text-gray-600">
            Build consistency, one day at a time
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Habit</span>
        </motion.button>
      </div>

      {/* Stats Banner */}
      {habits.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-4 border border-primary-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium text-gray-700">
                  {habits.filter(h => h.completedToday).length} of {habits.length} completed today
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">
                  {habits.reduce((sum, h) => sum + h.currentStreak, 0)} total streak days
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Habits Grid */}
      {habits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-gray-50 rounded-2xl"
        >
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No habits yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first habit to start building consistency
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Add Your First Habit
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onComplete={handleCompleteHabit}
                onUncomplete={handleUncompleteHabit}
                onEdit={handleEditHabit}
                onDelete={handleDeleteHabit}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Habit Modal */}
      <CreateHabitModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Edit Habit Modal */}
      <EditHabitModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        habit={editingHabit}
      />
    </div>
  )
}