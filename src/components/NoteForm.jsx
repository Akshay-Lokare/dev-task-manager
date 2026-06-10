import React, { useEffect, useRef, useState } from 'react'
import useNotesStore from '../store/useNotesStore'
import useTaskStore from '../store/useTaskStore'
import useSettingsStore from '../store/useSettingsStore'
import { IconClose, TYPE_ICONS } from './Icons'
import { NAME_PLACEHOLDERS_BY_MODE, normalizeUserMode } from '../constants/userMode'
import { resolveTypeTheme } from '../utils/typeLabels'
import NameAutocompleteInput, { filterNameSuggestions } from './NameAutocompleteInput'

const NOTE_TYPES = ['sprint', 'branch']
const SAVE_DELAY_MS = 600

export default function NoteForm({ onClose, editNote = null, defaultType = 'sprint' }) {
  const { addNote, updateNote } = useNotesStore()
  const getContextLabels = useTaskStore((s) => s.getContextLabels)
  const typeLabels = useSettingsStore((s) => s.settings.typeLabels)
  const userMode = useSettingsStore((s) => s.settings.userMode)
  const namePlaceholders = NAME_PLACEHOLDERS_BY_MODE[normalizeUserMode(userMode)]
  const [type, setType] = useState(editNote?.type ?? defaultType)
  const [contextName, setContextName] = useState(editNote?.contextName ?? '')
  const [title, setTitle] = useState(editNote?.title ?? '')
  const [content, setContent] = useState(editNote?.content ?? '')
  const [saveState, setSaveState] = useState('idle')
  const [noteId, setNoteId] = useState(editNote?.id ?? null)
  const [dirty, setDirty] = useState(false)
  const titleRef = useRef(null)
  const noteIdRef = useRef(editNote?.id ?? null)
  const saveTimerRef = useRef(null)
  const savedTimerRef = useRef(null)

  const contextSuggestions = filterNameSuggestions(getContextLabels(type), contextName)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  useEffect(() => () => {
    window.clearTimeout(saveTimerRef.current)
    window.clearTimeout(savedTimerRef.current)
  }, [])

  useEffect(() => {
    window.clearTimeout(saveTimerRef.current)

    if (!dirty) return undefined

    if (!contextName.trim() || !content.trim()) {
      setSaveState('idle')
      return undefined
    }

    saveTimerRef.current = window.setTimeout(async () => {
      setSaveState('saving')
      const payload = { type, contextName, title, content }

      try {
        if (noteIdRef.current) {
          await updateNote(noteIdRef.current, payload)
        } else {
          const note = await addNote(payload)
          noteIdRef.current = note.id
          setNoteId(note.id)
        }
        setSaveState('saved')
        window.clearTimeout(savedTimerRef.current)
        savedTimerRef.current = window.setTimeout(() => setSaveState('idle'), 2000)
      } catch {
        setSaveState('error')
      }
    }, SAVE_DELAY_MS)

    return () => window.clearTimeout(saveTimerRef.current)
  }, [dirty, type, contextName, title, content, addNote, updateNote])

  const markDirty = (updater) => {
    setDirty(true)
    updater()
  }

  const saveLabel = {
    idle: !contextName.trim() || !content.trim()
      ? 'Fill in name and note to save'
      : noteId
        ? 'All changes saved'
        : 'Start typing to save',
    saving: 'Saving…',
    saved: 'Saved',
    error: 'Could not save',
  }[saveState]

  const labelClass = 'block text-[11px] text-theme-muted mb-1.5'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/50 backdrop-blur-[1px]"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="surface-panel rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme bg-gradient-to-r from-pink-500/5 via-transparent to-transparent dark:from-pink-500/10">
          <div>
            <h2 className="text-sm font-semibold text-theme-ink">
              {noteId ? 'Edit note' : 'New note'}
            </h2>
            <p className={`text-[10px] mt-0.5 transition-colors
              ${saveState === 'error' ? 'text-danger' : saveState === 'saved' ? 'text-emerald-600 dark:text-emerald-400' : 'text-theme-muted'}`}
            >
              {saveLabel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-theme-muted hover:text-theme-ink transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-canvas dark:hover:bg-zinc-800"
          >
            <IconClose />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className={labelClass}>Type</label>
            <div className="flex gap-2">
              {NOTE_TYPES.map((id) => {
                const t = resolveTypeTheme(id, typeLabels)
                const Icon = TYPE_ICONS[id]
                const selected = type === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => markDirty(() => {
                      setType(id)
                      if (!noteId) setContextName('')
                    })}
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

          <div>
            <label className={labelClass}>{resolveTypeTheme(type, typeLabels).contextLabel} name</label>
            <NameAutocompleteInput
              value={contextName}
              onChange={(value) => markDirty(() => setContextName(value))}
              suggestions={contextSuggestions}
              placeholder={
                type === 'sprint' ? namePlaceholders.sprint : namePlaceholders.branch
              }
              inputClassName={`input-field ${type === 'branch' && userMode === 'dev' ? 'font-mono text-[13px]' : ''}`}
            />
          </div>

          <div>
            <label className={labelClass}>Title</label>
            <input
              ref={titleRef}
              type="text"
              placeholder="Optional heading"
              value={title}
              onChange={(event) => markDirty(() => setTitle(event.target.value))}
              className="input-field"
            />
          </div>

          <div>
            <label className={labelClass}>Note</label>
            <textarea
              placeholder="Write your note..."
              value={content}
              onChange={(event) => markDirty(() => setContent(event.target.value))}
              rows={6}
              className="input-field resize-none"
            />
          </div>

          <button type="button" onClick={onClose} className="w-full py-2.5 rounded-lg btn-ghost text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
