import React, { useEffect } from 'react'
import TaskBoard from './components/TaskBoard'
import useThemeStore from './store/useThemeStore'

export default function App() {
  const loadTheme = useThemeStore((s) => s.loadTheme)
  const themeLoaded = useThemeStore((s) => s.loaded)

  useEffect(() => {
    loadTheme()
  }, [])

  if (!themeLoaded) return null

  return <TaskBoard />
}
