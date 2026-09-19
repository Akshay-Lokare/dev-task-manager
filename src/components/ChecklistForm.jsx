import React, { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import useChecklistsStore from '../store/useChecklistsStore'
import useNotesStore from '../store/useNotesStore'
import useTaskStore from '../store/useTaskStore'
import useSettingsStore from '../store/useSettingsStore'
import { IconClose, IconTrash } from './Icons'
import { NAME_PLACEHOLDERS_BY_MODE, normalizeUserMode } from '../constants/userMode'
import { needsCloseConfirmWithoutContextName } from '../utils/confirmModalClose'
import { resolveTypeTheme } from '../utils/typeLabels'
import MissingContextNameDialog from './MissingContextNameDialog'
import NameAutocompleteInput, { filterNameSuggestions } from './NameAutocompleteInput'
import { ChecklistBox } from './ChecklistItemVisual'

const SAVE_DELAY_MS = 600

function createItem(text = '', done = false) {
  return { id: uuidv4(), text, done }
}

export default function ChecklistForm({ onClose, editList = null }) {
  const { addChecklist, updateChecklist } = useChecklistsStore()
  const checklists = useChecklistsStore((s) => s.checklists)
  const notes = useNotesStore((s) => s.notes)
  const getContextLabels = useTaskStore((s) => s.getContextLabels)
  const typeLabels = useSettingsStore((s) => s.settings.typeLabels)
  const userMode = useSettingsStore((s) => s.settings.userMode)
  const namePlaceholders = NAME_PLACEHOLDERS_BY_MODE[normalizeUserMode(userMode)]
  const sprintTheme = resolveTypeTheme('sprint', typeLabels)

  const [sprintName, setSprintName] = useState(editList?.sprintName ?? '')
  const [title, setTitle] = useState(editList?.title ?? '')
  const [items, setItems] = useState(() =>
    editList?.items?.length ? editList.items.map((item) => ({ ...item })) : []
  )
  const [draft, setDraft] = useState('')
  const [saveState, setSaveState] = useState('idle')
  const [listId, setListId] = useState(editList?.id ?? null)
  const [dirty, setDirty] = useState(false)
  const [editingItemId, setEditingItemId] = useState(null)
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false)
  const titleRef = useRef(null)
  const draftRef = useRef(null)
  const listIdRef = useRef(editList?.id ?? null)
  const saveTimerRef = useRef(null)
  const savedTimerRef = useRef(null)

  const sprintSuggestions = filterNameSuggestions(
    [
      ...getContextLabels('sprint'),
      ...notes.filter((note) => note.type === 'sprint').map((note) => note.contextName),
      ...checklists.map((list) => list.sprintName),
    ],
    sprintName
  )

  const filledItems = items.filter((item) => item.text.trim())
  const canSave = Boolean(sprintName.trim() && filledItems.length)

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

    const itemsToSave = items.filter((item) => item.text.trim())
    if (!sprintName.trim() || itemsToSave.length === 0) {
      setSaveState('idle')
      return undefined
    }

    saveTimerRef.current = window.setTimeout(async () => {
      setSaveState('saving')
      const payload = { sprintName, title, items: itemsToSave }

      try {
        if (listIdRef.current) {
          await updateChecklist(listIdRef.current, payload)
        } else {
          const list = await addChecklist(payload)
          listIdRef.current = list.id
          setListId(list.id)
        }
        setSaveState('saved')
        window.clearTimeout(savedTimerRef.current)
        savedTimerRef.current = window.setTimeout(() => setSaveState('idle'), 2000)
      } catch {
        setSaveState('error')
      }
    }, SAVE_DELAY_MS)

    return () => window.clearTimeout(saveTimerRef.current)
  }, [dirty, sprintName, title, items, addChecklist, updateChecklist])

  const markDirty = (updater) => {
    setDirty(true)
    updater()
  }

  const addDraftItem = () => {
    const text = draft.trim()
    if (!text) return
    markDirty(() => {
      setItems((current) => [...current, createItem(text)])
      setDraft('')
    })
  }

  const handleDraftKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addDraftItem()
    }
  }

  const handleItemKeyDown = (event, index) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      setEditingItemId(null)
      draftRef.current?.focus()
      return
    }

    if (event.key === 'Backspace' && !items[index].text) {
      event.preventDefault()
      markDirty(() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index)))
      setEditingItemId(null)
    }
  }

  const toggleItemDone = (itemId) => {
    markDirty(() => setItems((current) =>
      current.map((entry) =>
        entry.id === itemId ? { ...entry, done: !entry.done } : entry
      )
    ))
  }

  const saveLabel = {
    idle: !canSave
      ? 'Fill in name and at least one item to save'
      : listId
        ? 'All changes saved'
        : 'Start typing to save',
    saving: 'Saving…',
    saved: 'Saved',
    error: 'Could not save',
  }[saveState]

  const labelClass = 'block text-[11px] text-theme-muted mb-1.5'

  const handleClose = () => {
    const hasOtherInput = dirty || Boolean(
      title.trim() || filledItems.length || draft.trim() || listId
    )
    if (needsCloseConfirmWithoutContextName(sprintTheme.contextLabel, sprintName, hasOtherInput)) {
      setExitConfirmOpen(true)
      return
    }
    window.clearTimeout(saveTimerRef.current)
    onClose()
  }

  const handleLeaveWithoutSaving = () => {
    setExitConfirmOpen(false)
    window.clearTimeout(saveTimerRef.current)
    onClose()
  }

  return (
    <>
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/50 backdrop-blur-[1px]"
      onClick={(event) => event.target === event.currentTarget && !exitConfirmOpen && handleClose()}
    >
      <div className="surface-panel rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme bg-gradient-to-r from-pink-500/5 via-transparent to-transparent dark:from-pink-500/10">
          <div>
            <h2 className="text-sm font-semibold text-theme-ink">
              {listId ? 'Edit task' : 'New task'}
            </h2>
            <p className={`text-[10px] mt-0.5 transition-colors
              ${saveState === 'error' ? 'text-danger' : saveState === 'saved' ? 'text-emerald-600 dark:text-emerald-400' : 'text-theme-muted'}`}
            >
              {saveLabel}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-theme-muted hover:text-theme-ink transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-canvas dark:hover:bg-zinc-800"
          >
            <IconClose />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className={labelClass}>{sprintTheme.contextLabel} name</label>
            <NameAutocompleteInput
              value={sprintName}
              onChange={(value) => markDirty(() => setSprintName(value))}
              suggestions={sprintSuggestions}
              placeholder={namePlaceholders.sprint}
              inputClassName="input-field"
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
            <label className={labelClass}>Tasks</label>
            <div className="checklist-field">
              <ul className="checklist-list">
                {items.map((item, index) => (
                  <li key={item.id} className="group checklist-row-form">
                    <div
                      role="button"
                      tabIndex={0}
                      className="checklist-row flex-1 min-w-0 py-0.5"
                      onClick={(event) => {
                        if (event.target.closest('input')) return
                        if (editingItemId === item.id) return
                        toggleItemDone(item.id)
                      }}
                      onKeyDown={(event) => {
                        if (event.target.closest('input')) return
                        if (event.key !== 'Enter' && event.key !== ' ') return
                        event.preventDefault()
                        if (editingItemId === item.id) return
                        toggleItemDone(item.id)
                      }}
                    >
                      <ChecklistBox checked={item.done} />
                      {editingItemId === item.id ? (
                        <input
                          type="text"
                          autoFocus
                          value={item.text}
                          onChange={(event) => markDirty(() => setItems((current) =>
                            current.map((entry) =>
                              entry.id === item.id ? { ...entry, text: event.target.value } : entry
                            )
                          ))}
                          onBlur={() => setEditingItemId(null)}
                          onClick={(event) => event.stopPropagation()}
                          onKeyDown={(event) => handleItemKeyDown(event, index)}
                          className={`checklist-input ${item.done ? 'checklist-input-done' : ''}`}
                        />
                      ) : (
                        <span
                          className={`checklist-label ${item.done ? 'checklist-label-done' : ''}`}
                          onDoubleClick={(event) => {
                            event.stopPropagation()
                            setEditingItemId(item.id)
                          }}
                        >
                          {item.text}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        markDirty(() => setItems((current) =>
                          current.filter((entry) => entry.id !== item.id)
                        ))
                        if (editingItemId === item.id) setEditingItemId(null)
                      }}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-md text-zinc-300 hover:text-danger hover:bg-red-50 dark:text-zinc-600 dark:hover:bg-red-950/20 transition-all"
                      title="Remove item"
                    >
                      <IconTrash className="w-3 h-3" />
                    </button>
                  </li>
                ))}
                <li className="group checklist-row-form">
                  <div className="checklist-row flex-1 min-w-0 py-0.5 pointer-events-none">
                    <ChecklistBox disabled />
                    <input
                      ref={draftRef}
                      type="text"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={handleDraftKeyDown}
                      onBlur={addDraftItem}
                      placeholder={items.length ? 'Add another item' : 'Add an item'}
                      className="checklist-input pointer-events-auto"
                    />
                  </div>
                  <span className="w-7 flex-shrink-0" aria-hidden />
                </li>
              </ul>
            </div>
            <p className="mt-1.5 text-[10px] text-theme-muted">
              Click an item to check it off. Double-click to edit text. Press Enter to add another.
            </p>
          </div>

          <button type="button" onClick={handleClose} className="w-full py-2.5 rounded-lg btn-ghost text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
    <MissingContextNameDialog
      open={exitConfirmOpen}
      contextLabel={sprintTheme.contextLabel}
      onStay={() => setExitConfirmOpen(false)}
      onLeave={handleLeaveWithoutSaving}
    />
    </>
  )
}
