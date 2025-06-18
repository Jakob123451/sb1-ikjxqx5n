import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Home, 
  Target, 
  MessageCircle, 
  BookOpen, 
  LogOut,
  User,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Habits', href: '/habits', icon: Target },
  { name: 'AI Coach', href: '/coach', icon: MessageCircle },
  { name: 'Journal', href: '/journal', icon: BookOpen },
]

export function Navigation() {
  const { signOut } = useAuth()
  const { profile, getCurrentLevelProgress } = useProfile()

  return (
    <div className="bg-white border-r border-gray-200 w-64 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Xenoxy</span>
        </div>
      </div>

      {/* Profile Section */}
      {profile && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile.fullName || 'Adventurer'}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <span>Level {profile.level}</span>
                <span>•</span>
                <span>{profile.totalXp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>
          
          {/* Mini Progress Bar */}
          {profile.level < 50 && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getCurrentLevelProgress(profile.totalXp, profile.level)}%` }}
                  transition={{ duration: 0.8 }}
                  className="bg-gradient-to-r from-primary-400 to-primary-500 h-1.5 rounded-full"
                />
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">
                {Math.round(getCurrentLevelProgress(profile.totalXp, profile.level))}% to Level {profile.level + 1}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-500'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-gray-200">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={signOut}
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 w-full"
        >
          <LogOut className="w-5 h-5 text-gray-500" />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </div>
  )
}