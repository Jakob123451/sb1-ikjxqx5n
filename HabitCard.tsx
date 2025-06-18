import React from 'react'
import { motion } from 'framer-motion'
import { Check, Flame, Star, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { HabitWithStats } from '../hooks/useHabits'

interface HabitCardProps {
  habit: HabitWithStats
  onComplete: (habitId: string, xpReward: number) => void
  onUncomplete: (habitId: string) => void
  onEdit: (habit: HabitWithStats) => void
  onDelete: (habit: HabitWithStats) => void
}

export function HabitCard({ habit, onComplete, onUncomplete, onEdit, onDelete }: HabitCardProps) {
  const [showMenu, setShowMenu] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = () => {
    // Use the current habit state to determine action
    if (habit.completedToday) {
      onUncomplete(habit.id)
    } else {
      onComplete(habit.id, habit.xpReward)
    }
  }

  const handleEdit = () => {
    onEdit(habit)
    setShowMenu(false)
  }

  const handleDelete = () => {
    onDelete(habit)
    setShowMenu(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-all duration-200 ${
        habit.completedToday 
          ? 'border-green-200 bg-green-50' 
          : 'border-gray-100 hover:border-primary-200'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggle}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              habit.completedToday
                ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
                : 'border-gray-300 hover:border-primary-500'
            }`}
          >
            {habit.completedToday && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                <Check className="w-4 h-4" />
              </motion.div>
            )}
          </motion.button>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold truncate ${
              habit.completedToday ? 'text-green-800 line-through' : 'text-gray-900'
            }`}>
              {habit.name}
            </h3>
            {habit.description && (
              <p className="text-sm text-gray-600 mt-1 truncate">
                {habit.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-orange-600">
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium">{habit.xpReward}</span>
          </div>
          
          {/* Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            
            {/* Dropdown Menu */}
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]"
              >
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-red-600">
            <Flame className="w-4 h-4" />
            <span className="font-medium">{habit.currentStreak}</span>
          </div>
          <div className="text-gray-600">
            {habit.totalCompletions} completions
          </div>
        </div>

        {habit.completedToday && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-green-600 font-medium"
          >
            ✓ Completed
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}