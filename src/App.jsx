import React, { useEffect, useState } from 'react'
import TaskBoard from './components/TaskBoard'
import NotesPage from './components/NotesPage'
import AnalyticsPage from './components/AnalyticsPage'
import HiddenSettingsPage from './components/HiddenSettingsPage'
import useThemeStore from './store/useThemeStore'
import useSessionStore from './store/useSessionStore'

export default function App() {
  const loadTheme = useThemeStore((s) => s.loadTheme)
  const themeLoaded = useThemeStore((s) => s.loaded)
  const easterEggUnlocked = useSessionStore((s) => s.easterEggUnlocked)
  const [page, setPage] = useState('board')

  useEffect(() => {
    loadTheme()
  }, [])

  useEffect(() => {
    if (page === 'hidden-settings' && !easterEggUnlocked) {
      setPage('board')
    }
  }, [page, easterEggUnlocked])

  if (!themeLoaded) return null

  if (page === 'hidden-settings' && easterEggUnlocked) {
    return <HiddenSettingsPage onNavigate={setPage} />
  }

  if (page === 'notes') {
    return <NotesPage onNavigate={setPage} />
  }

  if (page === 'analytics') {
    return <AnalyticsPage onNavigate={setPage} />
  }

  return <TaskBoard onNavigate={setPage} />
}
