import React, { useMemo, useState } from 'react'
import useTaskStore from '../store/useTaskStore'
import useSettingsStore from '../store/useSettingsStore'
import TaskCard from './TaskCard'
import { IconEmpty, IconPaw, IconPlus, TYPE_ICONS } from './Icons'
import { TYPE_THEME } from '../constants/typeTheme'

export default function TaskColumn({ type, onAddTask, onEdit }) {
  const allTasks = useTaskStore((s) => s.tasks)
  const columnLabel = useSettingsStore((s) => s.settings.columnLabels[type])
  const tasks = useMemo(
    () => allTasks.filter((t) => t.type === type),
    [allTasks, type]
  )
  const [filter, setFilter] = useState('all')
  const [contextFilter, setContextFilter] = useState('all')
  const meta = TYPE_THEME[type]
  const TypeIcon = TYPE_ICONS[type]

  const contextLabels = type !== 'global'
    ? [...new Set(tasks.map((t) => t[meta.contextKey]).filter(Boolean))]
    : []

  const filtered = tasks.filter((t) => {
    const statusMatch = filter === 'all' || t.status === filter
    const contextMatch =
      contextFilter === 'all' ||
      (type !== 'global' && t[meta.contextKey] === contextFilter)
    return statusMatch && contextMatch
  })

  const todoTasks = filtered.filter((t) => t.status === 'todo')
  const doneTasks = filtered.filter((t) => t.status === 'done')
  const totalCount = tasks.length

  return (
    <section className="flex flex-col h-full min-h-0 relative">
      <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${meta.headerGlow} pointer-events-none`} />

      <div className="relative px-6 py-5 border-b border-theme">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${meta.gradient} shadow-sm`} />
            <div className="flex items-center gap-2">
              <TypeIcon className={`w-5 h-5 ${meta.icon}`} />
              <h2 className={`text-sm font-semibold bg-clip-text text-transparent ${meta.gradient}`}>
                {columnLabel}
              </h2>
              <span className="text-xs text-theme-muted">{totalCount}</span>
            </div>
          </div>
          <button
            onClick={() => onAddTask(type)}
            className="w-9 h-9 flex items-center justify-center rounded-lg btn-ghost"
            title="Add task"
          >
            <IconPlus className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-4">
          {['all', 'todo', 'done'].map((f, index) => (
            <React.Fragment key={f}>
              {index > 0 && <span className="h-3 w-px bg-line dark:bg-zinc-700" />}
              <button
                onClick={() => setFilter(f)}
                className={`inline-flex items-center gap-1 text-[11px] capitalize transition-all px-2.5 py-1 rounded-md
                  ${filter === f
                    ? `${meta.activeFilter} font-medium`
                    : 'text-theme-muted hover:text-theme-ink'}`}
              >
                <IconPaw className="w-3 h-3" />
                {f}
              </button>
            </React.Fragment>
          ))}

          {contextLabels.length > 0 && (
            <select
              value={contextFilter}
              onChange={(e) => setContextFilter(e.target.value)}
              className="select-field ml-auto"
            >
              <option value="all">All {columnLabel}s</option>
              {contextLabels.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="task-list relative flex-1 overflow-y-auto px-4 py-4 space-y-2 min-h-0">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <IconEmpty className={`w-10 h-10 ${meta.icon} opacity-40 mb-3`} />
            <p className="text-xs text-theme-muted">No tasks</p>
          </div>
        )}

        {todoTasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} accentGradient={meta.gradient} accentText={meta.text} />
        ))}

        {todoTasks.length > 0 && doneTasks.length > 0 && (
          <p className="text-[10px] text-theme-muted uppercase tracking-widest pt-4 pb-1 px-1 inline-flex items-center gap-1">
            <IconPaw className="w-3 h-3" />
            Done
          </p>
        )}

        {doneTasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} accentGradient={meta.gradient} accentText={meta.text} />
        ))}
      </div>
    </section>
  )
}
