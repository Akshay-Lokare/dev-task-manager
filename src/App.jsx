import React, { useEffect, useState } from 'react'
import TaskBoard from './components/TaskBoard'
import NotesPage from './components/NotesPage'
import AnalyticsPage from './components/AnalyticsPage'
import HiddenSettingsPage from './components/HiddenSettingsPage'
import SplashScreen from './components/SplashScreen'
import useThemeStore from './store/useThemeStore'
import useSessionStore from './store/useSessionStore'
import useSettingsStore from './store/useSettingsStore'
import useTaskStore from './store/useTaskStore'

const SPLASH_MIN_MS = 2500

export default function App() {
  const loadTheme = useThemeStore((s) => s.loadTheme)
  const themeLoaded = useThemeStore((s) => s.loaded)
  const loadSettings = useSettingsStore((s) => s.loadSettings)
  const settingsLoaded = useSettingsStore((s) => s.loaded)
  const autoDeleteHours = useSettingsStore((s) => s.settings.autoDeleteHours)
  const loadTasks = useTaskStore((s) => s.loadTasks)
  const tasksLoaded = useTaskStore((s) => s.loaded)
  const deleteExpiredTasks = useTaskStore((s) => s.deleteExpiredTasks)
  const easterEggUnlocked = useSessionStore((s) => s.easterEggUnlocked)
  const [page, setPage] = useState('board')
  const [splashMinElapsed, setSplashMinElapsed] = useState(false)

  useEffect(() => {
    loadTheme()
    loadSettings()
    loadTasks()
  }, [loadTheme, loadSettings, loadTasks])

  useEffect(() => {
    const timer = window.setTimeout(() => setSplashMinElapsed(true), SPLASH_MIN_MS)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!settingsLoaded || !tasksLoaded) return undefined

    deleteExpiredTasks(autoDeleteHours)
    const interval = window.setInterval(() => {
      deleteExpiredTasks(autoDeleteHours)
    }, 60 * 1000)

    return () => window.clearInterval(interval)
  }, [autoDeleteHours, deleteExpiredTasks, settingsLoaded, tasksLoaded])

  useEffect(() => {
    if (page === 'analytics' && !easterEggUnlocked) {
      setPage('board')
    }
  }, [page, easterEggUnlocked])

  const showSplash = !splashMinElapsed || !themeLoaded || !settingsLoaded
  if (showSplash) return <SplashScreen />

  if (page === 'settings') {
    return <HiddenSettingsPage onNavigate={setPage} />
  }

  if (page === 'notes') {
    return <NotesPage onNavigate={setPage} />
  }

  if (page === 'analytics' && easterEggUnlocked) {
    return <AnalyticsPage onNavigate={setPage} />
  }

  return <TaskBoard onNavigate={setPage} />
}
