import React, { useEffect, useRef, useState } from 'react'
import useTaskStore from '../store/useTaskStore'
import useSettingsStore, { DEFAULT_COLUMN_LABELS } from '../store/useSettingsStore'
import useThemeStore from '../store/useThemeStore'
import TaskColumn from './TaskColumn'
import TaskForm from './TaskForm'
import { IconClose, IconLoading, IconLogo, IconMoon, IconPaw, IconPlus, IconSun } from './Icons'
import appPackage from '../../package.json'

const COLUMN_TYPES = ['sprint', 'branch', 'global']

export default function TaskBoard() {
  const { deleteExpiredTasks, loadTasks, loaded, tasks } = useTaskStore()
  const { loadSettings, loaded: settingsLoaded, settings, setAutoDeleteHours, setColumnLabels } = useSettingsStore()
  const { theme, toggleTheme } = useThemeStore()
  const [formOpen, setFormOpen] = useState(false)
  const [formType, setFormType] = useState('global')
  const [editTask, setEditTask] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [columnCustomizeOpen, setColumnCustomizeOpen] = useState(false)
  const [draftColumnLabels, setDraftColumnLabels] = useState(DEFAULT_COLUMN_LABELS)
  const logoClickCountRef = useRef(0)
  const logoClickTimeoutRef = useRef(null)

  useEffect(() => {
    loadTasks()
    loadSettings()
  }, [])

  useEffect(() => {
    return () => window.clearTimeout(logoClickTimeoutRef.current)
  }, [])

  useEffect(() => {
    if (!loaded || !settingsLoaded) return undefined

    deleteExpiredTasks(settings.autoDeleteHours)
    const interval = window.setInterval(() => {
      deleteExpiredTasks(settings.autoDeleteHours)
    }, 60 * 1000)

    return () => window.clearInterval(interval)
  }, [deleteExpiredTasks, loaded, settings.autoDeleteHours, settingsLoaded])

  const openAdd = (type = 'global') => {
    setEditTask(null)
    setFormType(type)
    setFormOpen(true)
  }

  const openEdit = (task) => {
    setEditTask(task)
    setFormType(task.type)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditTask(null)
  }

  const handleLogoClick = () => {
    logoClickCountRef.current += 1

    if (logoClickCountRef.current >= 5) {
      setDraftColumnLabels(settings.columnLabels)
      setColumnCustomizeOpen(true)
      logoClickCountRef.current = 0
    }

    window.clearTimeout(logoClickTimeoutRef.current)
    logoClickTimeoutRef.current = window.setTimeout(() => {
      logoClickCountRef.current = 0
    }, 2000)
  }

  const closeColumnCustomize = () => {
    setColumnCustomizeOpen(false)
    setDraftColumnLabels(settings.columnLabels)
  }

  const saveColumnLabels = async () => {
    await setColumnLabels(draftColumnLabels)
    setColumnCustomizeOpen(false)
  }

  const resetColumnLabels = async () => {
    setDraftColumnLabels(DEFAULT_COLUMN_LABELS)
    await setColumnLabels(DEFAULT_COLUMN_LABELS)
  }

  const totalDone = tasks.filter((t) => t.status === 'done').length
  const totalAll = tasks.length
  const appVersion = appPackage.version

  if (!loaded || !settingsLoaded) {
    return (
      <div className="flex h-screen items-center justify-center app-shell">
        <div className="flex items-center gap-2 text-sm text-theme-muted">
          <IconLoading className="w-5 h-5" />
          Loading MeowLogger...
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col h-screen app-shell overflow-hidden">
      <header className="flex items-center justify-between px-8 py-5 surface-panel border-x-0 border-t-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogoClick}
            className="rounded-lg p-1 -m-1 transition-transform active:scale-95"
            title="MeowLogger"
          >
            <IconLogo className="w-8 h-8 text-theme-ink" />
          </button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-theme-ink">MeowLogger</h1>
            <p className="text-xs text-theme-muted mt-0.5">
              {totalAll === 0 ? 'Track sprint, branch, and global work' : `${totalDone} / ${totalAll} completed`}
            </p>
            <p className="text-[10px] text-theme-muted/80 mt-0.5">v{appVersion}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setSettingsOpen((value) => !value)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg btn-ghost text-xs"
              title="Settings"
            >
              <IconPaw className="w-4 h-4" />
              {settings.autoDeleteHours === 0 ? 'Keep forever' : `${settings.autoDeleteHours}h cleanup`}
            </button>

            {settingsOpen && (
              <div className="absolute right-0 top-11 z-40 w-64 rounded-xl surface-panel p-4 shadow-xl">
                <div className="flex items-center gap-2 text-theme-ink text-sm font-medium">
                  <IconPaw className="w-4 h-4 text-pink-500" />
                  Settings
                </div>
                <label className="block text-[11px] text-theme-muted mt-4 mb-1.5">
                  Auto delete tasks after
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={settings.autoDeleteHours}
                    onChange={(event) => setAutoDeleteHours(event.target.value)}
                    className="input-field py-2"
                  />
                  <span className="text-xs text-theme-muted">hours</span>
                </div>
                <p className="text-[10px] text-theme-muted mt-2">
                  Default is 6 hours. Set to 0 to keep tasks forever.
                </p>
              </div>
            )}
          </div>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-lg btn-ghost"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <IconMoon /> : <IconSun />}
          </button>
          <button
            onClick={() => openAdd('global')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg btn-primary text-xs font-medium"
          >
            <IconPlus className="w-4 h-4" />
            New task
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-3 divide-x divide-line dark:divide-zinc-800 min-h-0">
        <TaskColumn type="sprint" onAddTask={openAdd} onEdit={openEdit} />
        <TaskColumn type="branch" onAddTask={openAdd} onEdit={openEdit} />
        <TaskColumn type="global" onAddTask={openAdd} onEdit={openEdit} />
      </main>

      <p className="absolute bottom-2 right-4 text-[11px] text-theme-muted transition-colors hover:text-cyan-500 dark:hover:text-cyan-300">
        Made by Akshay
      </p>

      {formOpen && (
        <TaskForm onClose={closeForm} editTask={editTask} defaultType={formType} />
      )}

      {columnCustomizeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/50 backdrop-blur-[1px]"
          onClick={(event) => event.target === event.currentTarget && closeColumnCustomize()}
        >
          <div className="surface-panel rounded-xl w-full max-w-sm mx-4 overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
              <h2 className="text-sm font-semibold text-theme-ink">Customize columns</h2>
              <button
                type="button"
                onClick={closeColumnCustomize}
                className="text-theme-muted hover:text-theme-ink transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-canvas dark:hover:bg-zinc-800"
              >
                <IconClose />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {COLUMN_TYPES.map((type) => (
                <div key={type}>
                  <label className="block text-[11px] text-theme-muted mb-1.5 capitalize">
                    {DEFAULT_COLUMN_LABELS[type]} column
                  </label>
                  <input
                    type="text"
                    value={draftColumnLabels[type]}
                    onChange={(event) => setDraftColumnLabels((prev) => ({
                      ...prev,
                      [type]: event.target.value,
                    }))}
                    className="input-field"
                  />
                </div>
              ))}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={resetColumnLabels}
                  className="flex-1 py-2.5 rounded-lg btn-ghost text-sm"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={saveColumnLabels}
                  className="flex-1 py-2.5 rounded-lg btn-primary text-sm font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
