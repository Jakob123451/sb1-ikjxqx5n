import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { AuthForm } from './components/AuthForm'
import { Navigation } from './components/Navigation'
import { Dashboard } from './components/Dashboard'
import { HabitsView } from './components/HabitsView'
import { useAuth } from './contexts/AuthContext'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation />
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/habits" element={<HabitsView />} />
          <Route path="/coach" element={<div>Coach (Coming Soon)</div>} />
          <Route path="/journal" element={<div>Journal (Coming Soon)</div>} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'bg-white shadow-lg border border-gray-200',
            duration: 3000,
          }}
        />
      </Router>
    </AuthProvider>
  )
}

export default App