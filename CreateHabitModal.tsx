import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Circle, Heart, Zap, Coffee, Book, Dumbbell, Palette } from 'lucide-react'
import { useHabits } from '../hooks/useHabits'
import toast from 'react-hot-toast'

interface CreateHabitModalProps {
  isOpen: boolean
  onClose: () => void
}

const HABIT_ICONS = [
  { icon: Circle, name: 'Circle' },
  { icon: Heart, name: 'Heart' },
  { icon: Zap, name: 'Zap' },
  { icon: Coffee, name: 'Coffee' },
  { icon: Book, name: 'Book' },
  { icon: Dumbbell, name: 'Dumbbell' },
  { icon: Palette, name: 'Palette' }
]

const HABIT_COLORS = [
  '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#84cc16'
]

export function CreateHabitModal({ isOpen, onClose }: CreateHabitModalProps) {
  const { createHabit } = useHabits()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [xpReward, setXpReward] = useState(10)
  const [selectedIcon, setSelectedIcon] = useState('Circle')
  const [selectedColor, setSelectedColor] = useState('#6366f1')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    const { error } = await createHabit({
      name: name.trim(),
      description: description.trim() || undefined,
      xpReward: xpReward,
      icon: selectedIcon,
      color: selectedColor
    })

    if (error) {
      toast.error('Failed to create habit')
    } else {
      toast.success('Habit created successfully!')
      setName('')
      setDescription('')
      setXpReward(10)
      setSelectedIcon('Circle')
      setSelectedColor('#6366f1')
      onClose()
    }
    setLoading(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md relative z-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Create New Habit
              </h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Habit Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Morning meditation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Brief description of your habit"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  XP Reward
                </label>
                <input
                  type="number"
                  value={xpReward}
                  onChange={(e) => setXpReward(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="1"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {HABIT_ICONS.map(({ icon: Icon, name }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setSelectedIcon(name)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedIcon === name
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto" style={{ color: selectedColor }} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {HABIT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        selectedColor === color
                          ? 'border-gray-800 scale-110'
                          : 'border-gray-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Habit'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}