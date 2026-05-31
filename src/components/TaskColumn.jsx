import { useMemo } from 'react'
import useTaskStore from '../store/useTaskStore'
import useSettingsStore from '../store/useSettingsStore'
import TaskCard from './TaskCard'
import { IconEmpty, IconPlus, COLUMN_ICONS } from './Icons'
import { sortTasksByPriority } from '../constants/priority'
import { filterTasks, hasActiveFilters } from '../constants/taskFilters'

const STATUS_THEME = {
  todo: {
    gradientClass: 'task-card-todo',
    accentText: 'text-pink-600 dark:text-pink-400',
    accentBg: 'bg-pink-100 dark:bg-pink-950/40',
    assigneeChipClass: 'assignee-chip-todo',
    columnLine: 'bg-pink-400',
    countBg: 'bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300',
    columnIconClass: 'column-icon-todo',
  },
  inprogress: {
    gradientClass: 'task-card-inprogress',
    accentText: 'text-violet-600 dark:text-violet-400',
    accentBg: 'bg-violet-100 dark:bg-violet-950/40',
    assigneeChipClass: 'assignee-chip-inprogress',
    columnLine: 'bg-violet-500',
    countBg: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    columnIconClass: 'column-icon-inprogress',
  },
  done: {
    gradientClass: 'task-card-done',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    accentBg: 'bg-emerald-100 dark:bg-emerald-950/40',
    assigneeChipClass: 'assignee-chip-done',
    columnLine: 'bg-emerald-400',
    countBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    columnIconClass: 'column-icon-done',
  },
}

export default function TaskColumn({ status, onAddTask, onEdit, filters }) {
  const allTasks = useTaskStore((s) => s.tasks)
  const setStatus = useTaskStore((s) => s.setStatus)
  const columnLabel = useSettingsStore((s) => s.settings.columnLabels[status])
  const filtersActive = hasActiveFilters(filters)
  const tasks = useMemo(
    () => sortTasksByPriority(
      filterTasks(
        allTasks.filter((t) => (t.status ?? 'todo') === status),
        filters
      )
    ),
    [allTasks, status, filters]
  )
  const meta = STATUS_THEME[status]
  const ColumnIcon = COLUMN_ICONS[status]

  const handleDrop = async (event) => {
    event.preventDefault()
    const taskId = event.dataTransfer.getData('text/plain')
    if (taskId) {
      await setStatus(taskId, status)
    }
  }

  return (
    <section
      className="flex flex-col h-full min-h-0 relative"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-px ${meta.columnLine} opacity-40`} />

      <div className="task-column-header">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.14em] text-theme-muted font-medium mb-0.5">
              {status === 'todo' ? 'Queue' : status === 'inprogress' ? 'Active' : 'Finished'}
            </p>
            <div className="flex items-center gap-2 min-w-0">
              <span className={`column-icon ${meta.columnIconClass}`} title={status === 'todo' ? 'Queue' : status === 'inprogress' ? 'Active' : 'Finished'}>
                <ColumnIcon className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-sm font-semibold text-theme-ink truncate">{columnLabel}</h2>
              <span className={`text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded-md ${meta.countBg}`}>
                {tasks.length}
              </span>
            </div>
          </div>
          <button
            onClick={() => onAddTask('global', status)}
            className="w-8 h-8 flex items-center justify-center rounded-lg btn-ghost text-theme-muted"
            title="Add task"
          >
            <IconPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="task-list relative flex-1 overflow-y-auto px-3 py-3 space-y-1 min-h-0">
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 mx-1 rounded-xl border border-dashed border-line dark:border-zinc-800">
            <IconEmpty className="w-8 h-8 text-theme-muted/30 mb-2" />
            <p className="text-[11px] text-theme-muted">
              {filtersActive ? 'No matching tasks' : 'Nothing here yet'}
            </p>
          </div>
        )}

        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            gradientClass={meta.gradientClass}
            accentText={meta.accentText}
            accentBg={meta.accentBg}
            assigneeChipClass={meta.assigneeChipClass}
          />
        ))}
      </div>
    </section>
  )
}
