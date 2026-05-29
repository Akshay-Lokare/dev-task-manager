import React, { useState, useEffect } from 'react'
import useTaskStore from '../store/useTaskStore'
import { IconCheck, IconEdit, IconNote, IconTrash, IconUser } from './Icons'

export default function TaskCard({ task, onEdit, accentGradient = 'bg-grad-global', accentText = 'text-yellow-700' }) {
  const { toggleStatus, updateNotes, deleteTask } = useTaskStore()
  const [notesOpen, setNotesOpen] = useState(false)
  const [notesValue, setNotesValue] = useState(task.notes ?? '')
  const [notesDirty, setNotesDirty] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isDone = task.status === 'done'

  useEffect(() => {
    setNotesValue(task.notes ?? '')
  }, [task.notes])

  const handleNotesBlur = async () => {
    if (notesDirty) {
      await updateNotes(task.id, notesValue)
      setNotesDirty(false)
    }
  }

  const handleDelete = async () => {
    if (confirmDelete) {
      await deleteTask(task.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 2500)
    }
  }

  const contextLabel =
    task.type === 'sprint' && task.sprintName
      ? task.sprintName
      : task.type === 'branch' && task.branchName
      ? task.branchName
      : null

  return (
    <article className={`group rounded-xl px-3 py-3 transition-all surface-card surface-card-hover task-row relative overflow-hidden
      ${isDone ? 'opacity-55' : ''}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${accentGradient} opacity-80`} />

      <div className="flex items-start gap-3 pl-1">
        <button
          onClick={() => toggleStatus(task.id)}
          className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all
            ${isDone
              ? `${accentGradient} border-transparent text-white shadow-sm`
              : 'border-line dark:border-zinc-600 bg-canvas dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-500'
            }`}
          title={isDone ? 'Mark as todo' : 'Mark as done'}
        >
          {isDone && <IconCheck className="w-2.5 h-2.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-[13px] leading-snug break-words
            ${isDone ? 'line-through text-theme-muted' : 'text-theme-ink font-medium'}`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="text-[11px] text-theme-muted mt-1 leading-snug break-words">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {task.assignedTo && (
              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-canvas dark:bg-zinc-800 ${accentText} border border-line dark:border-zinc-700`}>
                <IconUser className="w-3.5 h-3.5" />
                {task.assignedTo}
              </span>
            )}
            {contextLabel && (
              <span className={`text-[10px] font-mono ${accentText} opacity-80`}>{contextLabel}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => setNotesOpen((v) => !v)}
            title="Notes"
            className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors
              ${notesOpen || (task.notes && task.notes.trim())
                ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30'
                : 'text-theme-muted hover:text-theme-ink hover:bg-canvas dark:hover:bg-zinc-800'}`}
          >
            <IconNote />
          </button>
          <button
            onClick={() => onEdit(task)}
            title="Edit"
            className="w-7 h-7 flex items-center justify-center rounded-md text-theme-muted hover:text-theme-ink hover:bg-canvas dark:hover:bg-zinc-800 transition-colors"
          >
            <IconEdit />
          </button>
          <button
            onClick={handleDelete}
            title={confirmDelete ? 'Click again to confirm' : 'Delete'}
            className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors
              ${confirmDelete
                ? 'text-danger bg-red-50 dark:bg-red-950/30'
                : 'text-theme-muted hover:text-danger hover:bg-red-50 dark:hover:bg-red-950/20'}`}
          >
            <IconTrash />
          </button>
        </div>
      </div>

      {notesOpen && (
        <div className="mt-3 ml-8">
          <textarea
            value={notesValue}
            onChange={(e) => { setNotesValue(e.target.value); setNotesDirty(true) }}
            onBlur={handleNotesBlur}
            placeholder="Notes..."
            rows={3}
            className="input-field text-[11px] resize-none"
          />
          {notesDirty && (
            <button
              onClick={async () => { await updateNotes(task.id, notesValue); setNotesDirty(false) }}
              className="mt-1 text-[10px] text-pink-600 dark:text-pink-400 font-medium hover:underline"
            >
              Save
            </button>
          )}
        </div>
      )}
    </article>
  )
}
