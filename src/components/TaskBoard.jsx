import React, { useEffect, useRef, useState } from 'react'
import useTaskStore from '../store/useTaskStore'
import useSettingsStore from '../store/useSettingsStore'
import useSessionStore from '../store/useSessionStore'
import useThemeStore from '../store/useThemeStore'
import TaskColumn from './TaskColumn'
import TaskForm from './TaskForm'
import TaskFilters from './TaskFilters'
import AppHeader from './AppHeader'
import { IconLoading, IconPlus } from './Icons'
import { DEFAULT_TASK_FILTERS, filterTasks, getTaskFilterOptions, hasActiveFilters } from '../constants/taskFilters'
import { formatTypeLabelsSubtitle } from '../utils/typeLabels'

export default function TaskBoard({ onNavigate }) {
  const { loadTasks, loaded, tasks } = useTaskStore()
  const typeLabels = useSettingsStore((s) => s.settings.typeLabels)
  const unlockEasterEgg = useSessionStore((s) => s.unlockEasterEgg)
  const { theme, toggleTheme } = useThemeStore()
  const [formOpen, setFormOpen] = useState(false)
  const [formType, setFormType] = useState('global')
  const [formStatus, setFormStatus] = useState('todo')
  const [editTask, setEditTask] = useState(null)
  const [filters, setFilters] = useState(DEFAULT_TASK_FILTERS)
  const logoClickCountRef = useRef(0)
  const logoClickTimeoutRef = useRef(null)

  useEffect(() => {
    if (!loaded) loadTasks()
  }, [loaded, loadTasks])

  useEffect(() => {
    return () => window.clearTimeout(logoClickTimeoutRef.current)
  }, [])

  const openAdd = (type = 'global', status = 'todo') => {
    setEditTask(null)
    setFormType(type)
    setFormStatus(status)
    setFormOpen(true)
  }

  const openEdit = (task) => {
    setEditTask(task)
    setFormType(task.type)
    setFormStatus(task.status ?? 'todo')
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditTask(null)
  }

  const handleNavigate = (page) => {
    closeForm()
    onNavigate(page)
  }

  const handleLogoClick = () => {
    logoClickCountRef.current += 1

    if (logoClickCountRef.current >= 5) {
      unlockEasterEgg()
      handleNavigate('analytics')
      logoClickCountRef.current = 0
    }

    window.clearTimeout(logoClickTimeoutRef.current)
    logoClickTimeoutRef.current = window.setTimeout(() => {
      logoClickCountRef.current = 0
    }, 2000)
  }

  const totalDone = tasks.filter((t) => t.status === 'done').length
  const totalAll = tasks.length
  const sectionLabels = formatTypeLabelsSubtitle(typeLabels)
  const filteredTasks = filterTasks(tasks, filters)
  const visibleCount = filteredTasks.length
  const filterOptions = getTaskFilterOptions(tasks)
  const filtersActive = hasActiveFilters(filters)

  if (!loaded) {
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
      <AppHeader
        page="board"
        onNavigate={handleNavigate}
        onLogoClick={handleLogoClick}
        subtitle={
          filtersActive
            ? `${visibleCount} of ${totalAll} tasks · ${totalDone} completed`
            : totalAll === 0
              ? `Track ${sectionLabels.toLowerCase()} work`
              : `${totalDone} / ${totalAll} completed`
        }
        theme={theme}
        onToggleTheme={toggleTheme}
        actions={(
          <button
            onClick={() => openAdd('global')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg btn-primary text-xs font-medium"
          >
            <IconPlus className="w-4 h-4" />
            New task
          </button>
        )}
      />

      <TaskFilters
        filters={filters}
        onChange={setFilters}
        options={filterOptions}
        visibleCount={visibleCount}
        totalCount={totalAll}
      />

      <main className="flex-1 grid grid-cols-3 min-h-0">
        <TaskColumn status="todo" onAddTask={openAdd} onEdit={openEdit} filters={filters} />
        <TaskColumn status="inprogress" onAddTask={openAdd} onEdit={openEdit} filters={filters} />
        <TaskColumn status="done" onAddTask={openAdd} onEdit={openEdit} filters={filters} />
      </main>

      <p className="absolute bottom-2 right-4 text-[11px] text-theme-muted transition-colors hover:text-violet-500 dark:hover:text-violet-400">
        Made by Akshay
      </p>

      {formOpen && (
        <TaskForm onClose={closeForm} editTask={editTask} defaultType={formType} defaultStatus={formStatus} />
      )}
    </div>
  )
}
