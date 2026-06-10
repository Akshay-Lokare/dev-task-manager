import useTaskStore from '../store/useTaskStore'
import useSettingsStore from '../store/useSettingsStore'
import { IconPaw, IconTrash, IconUser } from './Icons'
import { PRIORITY_THEME } from '../constants/priority'
import { formatTaskDate, formatTaskDateRange } from '../utils/dates'
import { resolveTypeTheme } from '../utils/typeLabels'

const NEXT_WORKFLOW = {
  todo: { status: 'inprogress', label: 'Start' },
  inprogress: { status: 'done', label: 'Complete' },
}

function TypeBadge({ isDone, accentText, accentBg, typeLabel }) {
  const badgeClass = `flex-shrink-0 mt-0.5 w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-semibold tracking-tight
    ${isDone
      ? 'bg-zinc-100 text-zinc-400 dark:bg-white/20 dark:text-white'
      : `${accentText} ${accentBg} dark:bg-white/20 dark:text-white`}`

  return (
    <span className={badgeClass} title={typeLabel}>
      <IconPaw className={`w-3 h-3 ${isDone ? 'opacity-60 dark:opacity-100' : ''}`} />
    </span>
  )
}

export default function TaskCard({ task, onEdit, gradientClass = 'task-card-todo', accentText = 'text-pink-600 dark:text-pink-400', accentBg = 'bg-pink-100 dark:bg-pink-950/40', assigneeChipClass = 'assignee-chip-todo', tagChipClass = 'task-tag-chip-todo' }) {
  const { setStatus, deleteTask } = useTaskStore()
  const typeLabels = useSettingsStore((s) => s.settings.typeLabels)
  const typeLabel = resolveTypeTheme(task.type, typeLabels).label
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
      : task.type === 'global' && task.globalName
      ? task.globalName
      : null

  const hasMeta = task.tag || task.assignedTo || contextLabel || task.startDate || task.endDate
  const dateLabel = isDone
    ? formatTaskDateRange(task.startDate, task.endDate)
    : formatTaskDate(task.startDate)

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', task.id)}
      onClick={() => onEdit(task)}
      className={`group task-card ${gradientClass} ${isDone ? 'opacity-55 hover:opacity-75 dark:opacity-100' : ''}`}
    >
      <TypeBadge isDone={isDone} accentText={accentText} accentBg={accentBg} typeLabel={typeLabel} />

      <div className="flex-1 min-w-0 pt-px">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`flex-shrink-0 ${priorityTheme.text} ${isDone ? 'opacity-75' : ''}`}
            title={`${priorityTheme.label} priority`}
          >
            <PriorityIcon className="w-4 h-4" />
          </span>
          <p className={`flex-1 min-w-0 text-[13px] leading-snug truncate ${isDone ? 'line-through text-theme-muted dark:text-white' : 'text-theme-ink font-medium'}`}>
            {task.title}
          </p>
        </div>

        {hasMeta && (
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {task.assignedTo && (
              <span className={`assignee-chip ${assigneeChipClass} inline-flex items-center gap-1 text-[10px] dark:text-white dark:border-white/30 dark:bg-white/15`}>
                <IconUser className="w-3 h-3 opacity-70 dark:opacity-100" />
                {task.assignedTo}
              </span>
            )}
            {task.tag && (
              <span
                className={`task-tag-chip ${tagChipClass} ${isDone ? 'opacity-80 dark:opacity-100' : ''}`}
                title={`Tag: ${task.tag}`}
              >
                <span className="opacity-50">#</span>
                {task.tag}
              </span>
            )}
            {dateLabel && (
              <span className={`text-[10px] tabular-nums ${isDone ? 'text-zinc-500/80 dark:text-white/90' : 'text-zinc-500/80 dark:text-white/85'}`}>
                {dateLabel}
              </span>
            )}
            {contextLabel && (
              <span className={`text-[10px] font-mono truncate max-w-[120px] ${isDone ? 'text-zinc-500/60 dark:text-white/80' : 'text-zinc-500/60 dark:text-white/75'}`}>
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
            className={`text-[10px] font-medium px-2 h-6 rounded-md transition-colors ${accentText} ${accentBg} hover:brightness-95 dark:text-white dark:bg-white/20 dark:hover:bg-white/30`}
          >
            {nextWorkflow.label}
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); deleteTask(task.id) }}
          className="w-6 h-6 flex items-center justify-center rounded-md transition-colors text-zinc-300 hover:text-danger hover:bg-red-50 dark:text-white dark:hover:text-red-300 dark:hover:bg-white/15"
          title="Delete task"
        >
          <IconTrash className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
