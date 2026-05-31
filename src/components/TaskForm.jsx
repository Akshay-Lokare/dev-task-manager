import React, { useEffect, useRef, useState } from 'react'
import useTaskStore from '../store/useTaskStore'
import useSessionStore from '../store/useSessionStore'
import { IconClose, IconUser, TYPE_ICONS } from './Icons'
import { PRIORITIES, PRIORITY_THEME } from '../constants/priority'
import { formatTaskDate, todayDateString } from '../utils/dates'
import { resolveTypeTheme } from '../utils/typeLabels'

const FORM_TYPES = ['sprint', 'branch', 'global']
const SAVE_DELAY_MS = 600
const PREVIOUS_WORKFLOW = {
  inprogress: { status: 'todo', label: 'Back to Todo' },
}

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div>
      <p className="block text-[11px] text-theme-muted mb-1">{label}</p>
      <p className="text-sm text-theme-ink whitespace-pre-wrap">{value}</p>
    </div>
  )
}

function CompletedTaskView({ task, onClose, onBackToProgress }) {
  const typeLabels = useSessionStore((s) => s.typeLabels)
  const typeTheme = resolveTypeTheme(task.type, typeLabels)
  const TypeIcon = TYPE_ICONS[task.type]
  const priorityTheme = PRIORITY_THEME[task.priority ?? 'mid']

  return (
    <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
      <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium ${typeTheme.activeFilter}`}>
            <TypeIcon className="w-3.5 h-3.5" />
            {typeTheme.label}
          </span>
          <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${priorityTheme.text}`}>
            <priorityTheme.Icon className="w-3.5 h-3.5" />
            {priorityTheme.label} priority
          </span>
        </div>

        <div>
          <p className="text-[11px] text-theme-muted mb-1">Title</p>
          <p className="text-sm font-medium text-theme-ink">{task.title}</p>
        </div>

        <DetailRow label="Description" value={task.description} />
        <DetailRow
          label={typeTheme.contextLabel ? `${typeTheme.contextLabel} name` : null}
          value={task.sprintName || task.branchName}
        />
        <DetailRow label="Assigned to" value={task.assignedTo} />
        <DetailRow label="Start date" value={formatTaskDate(task.startDate)} />

        <div>
          <p className="block text-[11px] text-theme-muted mb-1">End date</p>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 tabular-nums">
            {formatTaskDate(task.endDate) || '—'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onBackToProgress}
          className="flex-1 py-2.5 rounded-lg border border-violet-300/60 bg-violet-50 text-violet-700 text-sm font-medium transition-colors hover:bg-violet-100 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-300 dark:hover:bg-violet-950/60"
        >
          Back to In progress
        </button>
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg btn-ghost text-sm">
          Close
        </button>
      </div>
    </div>
  )
}

export default function TaskForm({ onClose, editTask = null, defaultType = 'global', defaultStatus = 'todo' }) {
  const { addTask, tasks, updateTask, setStatus: setTaskStatus } = useTaskStore()
  const typeLabels = useSessionStore((s) => s.typeLabels)
  const isCompletedView = editTask?.status === 'done'
  const [type, setType] = useState(editTask?.type ?? defaultType)
  const [status, setStatus] = useState(editTask?.status ?? defaultStatus)
  const [title, setTitle] = useState(editTask?.title ?? '')
  const [description, setDescription] = useState(editTask?.description ?? '')
  const [sprintName, setSprintName] = useState(editTask?.sprintName ?? '')
  const [branchName, setBranchName] = useState(editTask?.branchName ?? '')
  const [assignedTo, setAssignedTo] = useState(editTask?.assignedTo ?? '')
  const [priority, setPriority] = useState(editTask?.priority ?? 'mid')
  const [startDate, setStartDate] = useState(editTask?.startDate ?? todayDateString())
  const [saveState, setSaveState] = useState('idle')
  const [taskId, setTaskId] = useState(editTask?.id ?? null)
  const [dirty, setDirty] = useState(false)
  const titleRef = useRef(null)
  const taskIdRef = useRef(editTask?.id ?? null)
  const saveTimerRef = useRef(null)
  const savedTimerRef = useRef(null)
  const previousWorkflow = !isCompletedView && status === 'inprogress' ? PREVIOUS_WORKFLOW.inprogress : null

  const liveTask = taskId ? tasks.find((task) => task.id === taskId) ?? editTask : editTask

  const titleSuggestions = [...new Set(
    tasks
      .map((task) => task.title)
      .filter(Boolean)
      .filter((existingTitle) => existingTitle !== editTask?.title)
  )]
    .filter((existingTitle) => {
      const currentTitle = title.trim().toLowerCase()
      if (!currentTitle) return true
      return existingTitle.toLowerCase().includes(currentTitle)
    })
    .slice(0, 5)

  useEffect(() => {
    if (!isCompletedView) titleRef.current?.focus()
  }, [isCompletedView])

  useEffect(() => () => {
    window.clearTimeout(saveTimerRef.current)
    window.clearTimeout(savedTimerRef.current)
  }, [])

  useEffect(() => {
    if (isCompletedView) return undefined

    window.clearTimeout(saveTimerRef.current)

    if (!dirty) return undefined

    if (!title.trim()) {
      setSaveState('idle')
      return undefined
    }

    saveTimerRef.current = window.setTimeout(async () => {
      setSaveState('saving')
      const payload = {
        title: title.trim(),
        description,
        status,
        type,
        sprintName,
        branchName,
        assignedTo: assignedTo.trim(),
        priority,
        startDate,
      }

      try {
        if (taskIdRef.current) {
          await updateTask(taskIdRef.current, payload)
        } else {
          const task = await addTask(payload)
          taskIdRef.current = task.id
          setTaskId(task.id)
        }
        setSaveState('saved')
        window.clearTimeout(savedTimerRef.current)
        savedTimerRef.current = window.setTimeout(() => setSaveState('idle'), 2000)
      } catch {
        setSaveState('error')
      }
    }, SAVE_DELAY_MS)

    return () => window.clearTimeout(saveTimerRef.current)
  }, [isCompletedView, dirty, type, status, title, description, sprintName, branchName, assignedTo, priority, startDate, addTask, updateTask])

  const markDirty = (updater) => {
    setDirty(true)
    updater()
  }

  const saveLabel = {
    idle: !title.trim()
      ? 'Title required to save'
      : taskId
        ? 'All changes saved'
        : 'Start typing to save',
    saving: 'Saving…',
    saved: 'Saved',
    error: 'Could not save',
  }[saveState]

  const labelClass = 'block text-[11px] text-theme-muted mb-1.5'

  const handleBackToProgress = async () => {
    await setTaskStatus(taskIdRef.current, 'inprogress')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/50 backdrop-blur-[1px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="surface-panel rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme bg-gradient-to-r from-pink-500/5 via-transparent to-transparent dark:from-pink-500/10">
          <div>
            <h2 className="text-sm font-semibold text-theme-ink">
              {isCompletedView ? 'Completed task' : taskId ? 'Edit task' : 'New task'}
            </h2>
            {!isCompletedView && (
              <p className={`text-[10px] mt-0.5 transition-colors
                ${saveState === 'error' ? 'text-danger' : saveState === 'saved' ? 'text-emerald-600 dark:text-emerald-400' : 'text-theme-muted'}`}
              >
                {saveLabel}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-theme-muted hover:text-theme-ink transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-canvas dark:hover:bg-zinc-800"
          >
            <IconClose />
          </button>
        </div>

        {isCompletedView && liveTask ? (
          <CompletedTaskView
            task={liveTask}
            onClose={onClose}
            onBackToProgress={handleBackToProgress}
          />
        ) : (
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div>
              <label className={labelClass}>Type</label>
              <div className="flex gap-2">
                {FORM_TYPES.map((id) => {
                  const t = resolveTypeTheme(id, typeLabels)
                  const Icon = TYPE_ICONS[id]
                  const selected = type === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => markDirty(() => setType(id))}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs transition-all
                        ${selected ? t.formSelected : t.formIdle}`}
                    >
                      <Icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {type === 'sprint' && (
              <div>
                <label className={labelClass}>{resolveTypeTheme('sprint', typeLabels).contextLabel} name</label>
                <input
                  type="text"
                  placeholder="Sprint 12"
                  value={sprintName}
                  onChange={(e) => markDirty(() => setSprintName(e.target.value))}
                  className="input-field"
                />
              </div>
            )}
            {type === 'branch' && (
              <div>
                <label className={labelClass}>{resolveTypeTheme('branch', typeLabels).contextLabel} name</label>
                <input
                  type="text"
                  placeholder="feat/login"
                  value={branchName}
                  onChange={(e) => markDirty(() => setBranchName(e.target.value))}
                  className="input-field font-mono text-[13px]"
                />
              </div>
            )}

            <div>
              <label className={labelClass}>Title</label>
              <input
                ref={titleRef}
                type="text"
                list="task-title-suggestions"
                placeholder="What needs doing?"
                value={title}
                onChange={(e) => markDirty(() => setTitle(e.target.value))}
                className="input-field"
              />
              <datalist id="task-title-suggestions">
                {titleSuggestions.map((suggestion) => (
                  <option key={suggestion} value={suggestion} />
                ))}
              </datalist>
            </div>

            <div>
              <label className={labelClass}>Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => markDirty(() => setStartDate(e.target.value))}
                className="input-field py-2"
              />
            </div>

            <div>
              <label className={labelClass}>Priority</label>
              <div className="flex gap-2">
                {PRIORITIES.map((level) => {
                  const theme = PRIORITY_THEME[level]
                  const Icon = theme.Icon
                  const selected = priority === level
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => markDirty(() => setPriority(level))}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-medium transition-all
                        ${selected ? theme.selected : theme.idle}`}
                    >
                      <Icon className="w-4 h-4" />
                      {theme.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className={labelClass}>Assigned to</label>
              <div className="relative">
                <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                <input
                  type="text"
                  placeholder="Name"
                  value={assignedTo}
                  onChange={(e) => markDirty(() => setAssignedTo(e.target.value))}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                placeholder="Optional"
                value={description}
                onChange={(e) => markDirty(() => setDescription(e.target.value))}
                rows={2}
                className="input-field resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              {previousWorkflow && (
                <button
                  type="button"
                  onClick={async () => {
                    setStatus(previousWorkflow.status)
                    await setTaskStatus(taskIdRef.current, previousWorkflow.status)
                    setSaveState('saved')
                    window.clearTimeout(savedTimerRef.current)
                    savedTimerRef.current = window.setTimeout(() => setSaveState('idle'), 2000)
                  }}
                  className="rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-3 py-2 text-[11px] font-medium text-cyan-700 transition-colors hover:bg-cyan-500/15 dark:text-cyan-300"
                >
                  {previousWorkflow.label}
                </button>
              )}
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg btn-ghost text-sm">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
