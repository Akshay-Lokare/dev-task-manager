import { useEffect, useState } from 'react'
import useTaskStore from '../store/useTaskStore'
import useThemeStore from '../store/useThemeStore'
import AppHeader from './AppHeader'
import ProductivityChart from './ProductivityChart'
import { IconLoading } from './Icons'
import { PRODUCTIVITY_RANGES } from '../utils/productivity'

export default function AnalyticsPage({ onNavigate }) {
  const { loadTasks, loaded, tasks } = useTaskStore()
  const { theme, toggleTheme } = useThemeStore()
  const [months, setMonths] = useState(1)

  useEffect(() => {
    if (!loaded) loadTasks()
  }, [loaded, loadTasks])

  const selectedRange = PRODUCTIVITY_RANGES.find((range) => range.months === months) ?? PRODUCTIVITY_RANGES[0]
  const completedCount = tasks.filter((task) => (task.status ?? 'todo') === 'done').length

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center app-shell">
        <div className="flex items-center gap-2 text-sm text-theme-muted">
          <IconLoading className="w-5 h-5" />
          Loading analytics...
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col h-screen app-shell overflow-hidden">
      <AppHeader
        page="analytics"
        onNavigate={onNavigate}
        subtitle={`${completedCount} completed ${completedCount === 1 ? 'task' : 'tasks'} tracked`}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="px-8 py-4 border-b border-theme surface-panel border-x-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold text-theme-ink">Productivity</h2>
            <p className="text-xs text-theme-muted mt-0.5">Tasks completed per day</p>
          </div>

          <div className="flex gap-2 p-1 rounded-lg bg-canvas dark:bg-zinc-950/80">
            {PRODUCTIVITY_RANGES.map((range) => {
              const active = months === range.months
              return (
                <button
                  key={range.months}
                  type="button"
                  onClick={() => setMonths(range.months)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                    ${active
                      ? 'bg-white dark:bg-zinc-900 text-theme-ink shadow-sm'
                      : 'text-theme-muted hover:text-theme-ink'}`}
                >
                  {range.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-8 py-6 min-h-0">
        <div className="max-w-5xl mx-auto">
          <ProductivityChart tasks={tasks} dayCount={selectedRange.days} />
        </div>
      </main>

      <p className="absolute bottom-2 right-4 text-[11px] text-theme-muted transition-colors hover:text-violet-500 dark:hover:text-violet-400">
        Made by Akshay
      </p>
    </div>
  )
}
