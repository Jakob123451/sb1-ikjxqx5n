import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Trophy, Target, Flame, Star, TrendingUp } from 'lucide-react'
import { useProfile } from '../hooks/useProfile'
import { useHabits } from '../hooks/useHabits'
import { CreateHabitModal } from './CreateHabitModal'

export function Dashboard() {
  const { profile, getXpToNextLevel, getCurrentLevelProgress } = useProfile()
  const { habits } = useHabits()
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)

  if (!profile) return null

  const completedToday = habits.filter(h => h.completedToday).length
  const totalHabits = habits.length
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0
  const longestStreak = Math.max(...habits.map(h => h.currentStreak), 0)
  const xpToNextLevel = getXpToNextLevel(profile.totalXp, profile.level)
  const currentLevelProgress = getCurrentLevelProgress(profile.totalXp, profile.level)

  const stats = [
    {
      label: 'Current Level',
      value: profile.level,
      icon: Star,
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-50'
    },
    {
      label: 'Total XP',
      value: profile.totalXp.toLocaleString(),
      icon: Trophy,
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Longest Streak',
      value: longestStreak,
      icon: Flame,
      color: 'from-red-400 to-orange-500',
      bgColor: 'bg-red-50'
    },
    {
      label: 'Today\'s Progress',
      value: `${completedToday}/${totalHabits}`,
      icon: Target,
      color: 'from-green-400 to-blue-500',
      bgColor: 'bg-green-50'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {profile.fullName || 'Adventurer'}!
            </h1>
            <p className="text-primary-100 mb-4">
              {profile.currentPurpose 
                ? `Your purpose: ${profile.currentPurpose}`
                : "Let's discover your purpose together"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-primary-200">Completion Rate</div>
            <div className="text-3xl font-bold">{completionRate}%</div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-primary-200 mb-2">
            <span>Level {profile.level}</span>
            <span>
              {profile.level >= 50 
                ? 'Max Level Reached!' 
                : `${xpToNextLevel.toLocaleString()} XP to next level`
              }
            </span>
          </div>
          <div className="w-full bg-primary-400 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentLevelProgress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-white h-3 rounded-full flex items-center justify-end pr-1"
            >
              <TrendingUp className="w-2 h-2 text-primary-500" />
            </motion.div>
          </div>
          <div className="flex justify-between text-xs text-primary-200 mt-1">
            <span>{Math.round(currentLevelProgress)}% to Level {profile.level + 1}</span>
            {profile.level < 50 && (
              <span className="font-medium">
                Next: {(xpToNextLevel + profile.totalXp).toLocaleString()} XP
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bgColor} rounded-xl p-4 border border-gray-100`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Level Milestone Banner */}
      {profile.level >= 5 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 text-white"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {profile.level >= 20 ? 'Legendary Achiever!' : 
                 profile.level >= 15 ? 'Master of Habits!' :
                 profile.level >= 10 ? 'Habit Champion!' : 
                 'Rising Star!'}
              </h3>
              <p className="text-yellow-100">
                You've reached Level {profile.level} - keep building those habits!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <Target className="w-6 h-6 text-primary-600 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Add Habit</div>
              <div className="text-sm text-gray-600">Create a new habit</div>
            </div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/journal')}
            className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Trophy className="w-6 h-6 text-green-600 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Journal Entry</div>
              <div className="text-sm text-gray-600">Reflect on your day</div>
            </div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/coach')}
            className="flex items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <Flame className="w-6 h-6 text-purple-600 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">AI Coach</div>
              <div className="text-sm text-gray-600">Get guidance</div>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Create Habit Modal */}
      <CreateHabitModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}