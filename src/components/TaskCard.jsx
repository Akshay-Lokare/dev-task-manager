import { useState } from 'react'
import useTaskStore from '../store/useTaskStore'
import useSessionStore from '../store/useSessionStore'
import { IconPaw, IconTrash, IconUser } from './Icons'
import { PRIORITY_THEME } from '../constants/priority'
import { formatTaskDate, formatTaskDateRange } from '../utils/dates'
import { resolveTypeTheme } from '../utils/typeLabels'

const NEXT_WORKFLOW = {
  todo: { status: 'inprogress', label: 'Start' },
  inprogress: { status: 'done', label: 'Complete' },
}

const TYPE_LABEL = {
  branch: 'B',
  global: 'G',
}

function TypeBadge({ type, isDone, accentText, accentBg, typeLabel }) {
  const badgeClass = `flex-shrink-0 mt-0.5 w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-semibold tracking-tight
    ${isDone
      ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
      : `${accentText} ${accentBg}`}`

  if (type === 'sprint') {
    return (
      <span className={badgeClass} title={typeLabel}>
        <IconPaw className={`w-3 h-3 ${isDone ? 'opacity-60' : ''}`} />
      </span>
    )
  }

  return (
    <span className={badgeClass} title={typeLabel}>
      {TYPE_LABEL[type] ?? 'G'}
    </span>
  )
}

export default function TaskCard({ task, onEdit, gradientClass = 'task-card-todo', accentText = 'text-pink-600 dark:text-pink-400', accentBg = 'bg-pink-100 dark:bg-pink-950/40', assigneeChipClass = 'assignee-chip-todo' }) {
  const { setStatus, deleteTask } = useTaskStore()
  const typeLabels = useSessionStore((s) => s.typeLabels)
  const typeLabel = resolveTypeTheme(task.type, typeLabels).label
  const [confirmDelete, setConfirmDelete] = useState(false)
  const currentStatus = task.status ?? 'todo'
  const isDone = currentStatus === 'done'
  const nextWorkflow = NEXT_WORKFLOW[currentStatus]
  const priority = task.priority ?? 'mid'
  const priorityTheme = PRIORITY_THEME[priority] ?? PRIORITY_THEME.mid
  const PriorityIcon = priorityTheme.Icon

  const contextLabel =
    task.type === 'sprint' && task.sprintName
      ? task.sprintName
      : task.type === 'branch' && task.branchName
      ? task.branchName
      : null

  const hasMeta = task.assignedTo || contextLabel || task.startDate || task.endDate
  const dateLabel = isDone
    ? formatTaskDateRange(task.startDate, task.endDate)
    : formatTaskDate(task.startDate)

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', task.id)}
      onClick={() => onEdit(task)}
      className={`group task-card ${gradientClass} ${isDone ? 'opacity-55 hover:opacity-75' : ''}`}
    >
      <TypeBadge type={task.type} isDone={isDone} accentText={accentText} accentBg={accentBg} typeLabel={typeLabel} />

      <div className="flex-1 min-w-0 pt-px">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`flex-shrink-0 ${isDone ? 'text-theme-muted' : priorityTheme.text}`} title={`${priorityTheme.label} priority`}>
            <PriorityIcon className="w-3.5 h-3.5" />
          </span>
          <p className={`text-[13px] leading-snug truncate ${isDone ? 'line-through text-theme-muted' : 'text-theme-ink font-medium'}`}>
            {task.title}
          </p>
        </div>

        {hasMeta && (
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {task.assignedTo && (
              <span className={`assignee-chip ${assigneeChipClass} inline-flex items-center gap-1 text-[10px]`}>
                <IconUser className="w-3 h-3 opacity-70" />
                {task.assignedTo}
              </span>
            )}
            {dateLabel && (
              <span className="text-[10px] text-theme-muted/80 tabular-nums">
                {dateLabel}
              </span>
            )}
            {contextLabel && (
              <span className="text-[10px] font-mono text-theme-muted/60 truncate max-w-[120px]">
                {contextLabel}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 self-center">
        {nextWorkflow && (
          <button
            onClick={(e) => { e.stopPropagation(); setStatus(task.id, nextWorkflow.status) }}
            className={`text-[10px] font-medium px-2 h-6 rounded-md transition-colors ${accentText}
              ${accentBg} hover:brightness-95`}
          >
            {nextWorkflow.label}
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (confirmDelete) deleteTask(task.id)
            else {
              setConfirmDelete(true)
              setTimeout(() => setConfirmDelete(false), 2500)
            }
          }}
          className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors
            ${confirmDelete
              ? 'bg-red-50 text-danger dark:bg-red-950/30'
              : 'text-zinc-300 hover:text-danger hover:bg-red-50 dark:text-zinc-600 dark:hover:bg-red-950/20'}`}
        >
          <IconTrash className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
