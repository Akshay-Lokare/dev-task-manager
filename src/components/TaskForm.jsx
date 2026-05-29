import React, { useState, useEffect, useRef } from 'react'
import useTaskStore from '../store/useTaskStore'
import useSettingsStore from '../store/useSettingsStore'
import { IconClose, IconUser, TYPE_ICONS } from './Icons'
import { TYPE_THEME } from '../constants/typeTheme'

const FORM_TYPES = ['sprint', 'branch', 'global']

export default function TaskForm({ onClose, editTask = null, defaultType = 'global' }) {
  const { addTask, tasks, updateTask } = useTaskStore()
  const columnLabels = useSettingsStore((s) => s.settings.columnLabels)
  const [type, setType] = useState(editTask?.type ?? defaultType)
  const [title, setTitle] = useState(editTask?.title ?? '')
  const [description, setDescription] = useState(editTask?.description ?? '')
  const [sprintName, setSprintName] = useState(editTask?.sprintName ?? '')
  const [branchName, setBranchName] = useState(editTask?.branchName ?? '')
  const [assignedTo, setAssignedTo] = useState(editTask?.assignedTo ?? '')
  const [notes, setNotes] = useState(editTask?.notes ?? '')
  const [error, setError] = useState('')
  const titleRef = useRef(null)

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
    titleRef.current?.focus()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    const payload = {
      title,
      description,
      type,
      sprintName,
      branchName,
      assignedTo: assignedTo.trim(),
      notes,
    }
    if (editTask) {
      await updateTask(editTask.id, payload)
    } else {
      await addTask(payload)
    }
    onClose()
  }

  const labelClass = 'block text-[11px] text-theme-muted mb-1.5'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/50 backdrop-blur-[1px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="surface-panel rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme bg-gradient-to-r from-pink-500/5 via-transparent to-transparent dark:from-pink-500/10">
          <h2 className="text-sm font-semibold text-theme-ink">
            {editTask ? 'Edit task' : 'New task'}
          </h2>
          <button
            onClick={onClose}
            className="text-theme-muted hover:text-theme-ink transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-canvas dark:hover:bg-zinc-800"
          >
            <IconClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className={labelClass}>Type</label>
            <div className="flex gap-2">
              {FORM_TYPES.map((id) => {
                const t = TYPE_THEME[id]
                const Icon = TYPE_ICONS[id]
                const selected = type === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setType(id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs transition-all
                      ${selected ? t.formSelected : t.formIdle}`}
                  >
                    <Icon className="w-4 h-4" />
                    {columnLabels[id]}
                  </button>
                )
              })}
            </div>
          </div>

          {type === 'sprint' && (
            <div>
              <label className={labelClass}>{columnLabels.sprint} name</label>
              <input type="text" placeholder="Sprint 12" value={sprintName} onChange={(e) => setSprintName(e.target.value)} className="input-field" />
            </div>
          )}
          {type === 'branch' && (
            <div>
              <label className={labelClass}>{columnLabels.branch} name</label>
              <input type="text" placeholder="feat/login" value={branchName} onChange={(e) => setBranchName(e.target.value)} className="input-field font-mono text-[13px]" />
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
              onChange={(e) => { setTitle(e.target.value); setError('') }}
              className={`input-field ${error ? 'border-danger ring-2 ring-danger/20' : ''}`}
            />
            <datalist id="task-title-suggestions">
              {titleSuggestions.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
            {error && <p className="text-danger text-[11px] mt-1">{error}</p>}
          </div>

          <div>
            <label className={labelClass}>Assigned to</label>
            <div className="relative">
              <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
              <input
                type="text"
                placeholder="Name"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea placeholder="Optional" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="input-field resize-none" />
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea placeholder="Links, context..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input-field resize-none" />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg btn-ghost text-sm">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg btn-primary text-sm font-medium">
              {editTask ? 'Save' : 'Add task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
