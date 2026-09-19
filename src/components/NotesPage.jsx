import React, { useEffect, useMemo, useState } from 'react'
import useNotesStore from '../store/useNotesStore'
import useChecklistsStore from '../store/useChecklistsStore'
import useTaskStore from '../store/useTaskStore'
import useThemeStore from '../store/useThemeStore'
import useSettingsStore from '../store/useSettingsStore'
import NoteForm from './NoteForm'
import ChecklistForm from './ChecklistForm'
import AppHeader from './AppHeader'
import { ChecklistToggleRow } from './ChecklistItemVisual'
import { IconEmpty, IconLoading, IconNote, IconPlus, IconTrash, TYPE_ICONS } from './Icons'
import { resolveTypeTheme } from '../utils/typeLabels'

const FILTER_TYPES = ['sprint', 'branch']

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function NotesPage({ onNavigate }) {
  const { loadNotes, loaded, deleteNote, notes } = useNotesStore()
  const {
    loadChecklists,
    loaded: checklistsLoaded,
    deleteChecklist,
    toggleChecklistItem,
    checklists,
  } = useChecklistsStore()
  const loadTasks = useTaskStore((s) => s.loadTasks)
  const tasksLoaded = useTaskStore((s) => s.loaded)
  const { theme, toggleTheme } = useThemeStore()
  const typeLabels = useSettingsStore((s) => s.settings.typeLabels)
  const sprintTheme = resolveTypeTheme('sprint', typeLabels)
  const SprintIcon = TYPE_ICONS.sprint
  const [innerPage, setInnerPage] = useState('notes')
  const [filter, setFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editNote, setEditNote] = useState(null)
  const [editList, setEditList] = useState(null)
  const [defaultType, setDefaultType] = useState('sprint')
  const showingTasks = innerPage === 'tasks'

  useEffect(() => {
    loadNotes()
    loadChecklists()
    if (!tasksLoaded) loadTasks()
  }, [])

  const filteredNotes = useMemo(() => {
    const list = filter === 'all' ? notes : notes.filter((note) => note.type === filter)
    return [...list].sort((a, b) => {
      const timeA = Date.parse(a.updatedAt ?? a.createdAt ?? '') || 0
      const timeB = Date.parse(b.updatedAt ?? b.createdAt ?? '') || 0
      return timeB - timeA
    })
  }, [filter, notes])

  const sortedChecklists = useMemo(() => {
    return [...checklists].sort((a, b) => {
      const timeA = Date.parse(a.updatedAt ?? a.createdAt ?? '') || 0
      const timeB = Date.parse(b.updatedAt ?? b.createdAt ?? '') || 0
      return timeB - timeA
    })
  }, [checklists])

  const switchInnerPage = (page) => {
    setInnerPage(page)
    setFormOpen(false)
    setEditNote(null)
    setEditList(null)
  }

  const openAdd = (type = 'sprint') => {
    setEditNote(null)
    setEditList(null)
    setDefaultType(type)
    setFormOpen(true)
  }

  const openEdit = (note) => {
    setEditList(null)
    setEditNote(note)
    setDefaultType(note.type)
    setFormOpen(true)
  }

  const openAddChecklist = () => {
    setEditNote(null)
    setEditList(null)
    setFormOpen(true)
  }

  const openEditChecklist = (list) => {
    setEditNote(null)
    setEditList(list)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditNote(null)
    setEditList(null)
  }

  if (!loaded || !checklistsLoaded) {
    return (
      <div className="flex h-screen items-center justify-center app-shell">
        <div className="flex items-center gap-2 text-sm text-theme-muted">
          <IconLoading className="w-5 h-5" />
          Loading notes...
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col h-screen app-shell overflow-hidden">
      <AppHeader
        page="notes"
        onNavigate={onNavigate}
        subtitle={showingTasks
          ? `${checklists.length} ${checklists.length === 1 ? 'task list' : 'task lists'} for sprints`
          : `${notes.length} ${notes.length === 1 ? 'note' : 'notes'} for sprints and branches`}
        theme={theme}
        onToggleTheme={toggleTheme}
        actions={(
          <button
            onClick={() => showingTasks ? openAddChecklist() : openAdd(filter === 'branch' ? 'branch' : 'sprint')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg btn-primary text-xs font-medium"
          >
            <IconPlus className="w-4 h-4" />
            {showingTasks ? 'New task' : 'New note'}
          </button>
        )}
      />

      <div className="px-8 py-4 border-b border-theme surface-panel border-x-0">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center p-1 rounded-lg bg-canvas dark:bg-zinc-950/80">
            {[
              { id: 'notes', label: 'Notes' },
              { id: 'tasks', label: 'Tasks' },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={innerPage === id}
                onClick={() => switchInnerPage(id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${innerPage === id
                    ? 'bg-white dark:bg-zinc-900 text-theme-ink shadow-sm'
                    : 'text-theme-muted hover:text-theme-ink'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {!showingTasks && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${filter === 'all'
                    ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 ring-1 ring-violet-500/20'
                    : 'btn-ghost'}`}
              >
                All
              </button>
              {FILTER_TYPES.map((id) => {
                const t = resolveTypeTheme(id, typeLabels)
                const Icon = TYPE_ICONS[id]
                const active = filter === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFilter(id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                      ${active ? t.activeFilter : 'btn-ghost'}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-8 py-6 min-h-0">
        {showingTasks ? (
          sortedChecklists.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <IconEmpty className="w-12 h-12 text-zinc-400/30 dark:text-zinc-500/30 mb-3" />
              <p className="text-sm text-theme-muted">No tasks yet</p>
              <p className="text-xs text-zinc-500/70 dark:text-zinc-400/70 mt-1 max-w-xs">
                Make a checklist for a sprint — check items off as you go.
              </p>
              <button
                onClick={openAddChecklist}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg btn-primary text-xs font-medium"
              >
                <IconPlus className="w-4 h-4" />
                Add a task
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 max-w-6xl">
              {sortedChecklists.map((list) => (
                <article
                  key={list.id}
                  onClick={(event) => {
                    if (event.target.closest('button, a, input, textarea, select')) return
                    openEditChecklist(list)
                  }}
                  className="group surface-panel rounded-xl p-4 cursor-pointer transition-all hover:-translate-y-px hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${sprintTheme.activeFilter}`}>
                        <SprintIcon className="w-3 h-3" />
                        {sprintTheme.label}
                      </span>
                      <span className="text-[11px] font-mono text-theme-muted truncate">
                        {list.sprintName}
                      </span>
                    </div>
                    <button
                      onClick={(event) => {
                        event.stopPropagation()
                        deleteChecklist(list.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-md text-zinc-300 hover:text-danger hover:bg-red-50 dark:text-zinc-600 dark:hover:bg-red-950/20 transition-all"
                      title="Delete task"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {list.title ? (
                    <h3 className="mt-3 text-sm font-semibold text-theme-ink truncate">{list.title}</h3>
                  ) : (
                    <div className="mt-3 flex items-center gap-1.5 text-theme-muted">
                      <IconNote className="w-3.5 h-3.5 opacity-60" />
                      <span className="text-xs">Untitled task</span>
                    </div>
                  )}

                  <ul className="checklist-list mt-2">
                    {list.items.slice(0, 6).map((item) => (
                      <li key={item.id}>
                        <ChecklistToggleRow
                          checked={item.done}
                          onToggle={() => toggleChecklistItem(list.id, item.id)}
                        >
                          {item.text}
                        </ChecklistToggleRow>
                      </li>
                    ))}
                    {list.items.length > 6 && (
                      <li className="text-[11px] text-theme-muted pl-2 pt-1">
                        +{list.items.length - 6} more
                      </li>
                    )}
                  </ul>

                  <p className="mt-3 text-[10px] text-zinc-500/70 dark:text-zinc-400/70">
                    Updated {formatDate(list.updatedAt ?? list.createdAt)}
                  </p>
                </article>
              ))}
            </div>
          )
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <IconEmpty className="w-12 h-12 text-zinc-400/30 dark:text-zinc-500/30 mb-3" />
            <p className="text-sm text-theme-muted">No notes yet</p>
            <p className="text-xs text-zinc-500/70 dark:text-zinc-400/70 mt-1 max-w-xs">
              Capture context for a sprint or branch — decisions, blockers, reminders.
            </p>
            <button
              onClick={() => openAdd(filter === 'branch' ? 'branch' : 'sprint')}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg btn-primary text-xs font-medium"
            >
              <IconPlus className="w-4 h-4" />
              Write a note
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 max-w-6xl">
            {filteredNotes.map((note) => {
              const theme = resolveTypeTheme(note.type, typeLabels)
              const Icon = TYPE_ICONS[note.type]
              return (
                <article
                  key={note.id}
                  onClick={() => openEdit(note)}
                  className="group surface-panel rounded-xl p-4 cursor-pointer transition-all hover:-translate-y-px hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${theme.activeFilter}`}>
                        <Icon className="w-3 h-3" />
                        {theme.label}
                      </span>
                      <span className="text-[11px] font-mono text-theme-muted truncate">
                        {note.contextName}
                      </span>
                    </div>
                    <button
                      onClick={(event) => {
                        event.stopPropagation()
                        deleteNote(note.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-md text-zinc-300 hover:text-danger hover:bg-red-50 dark:text-zinc-600 dark:hover:bg-red-950/20 transition-all"
                      title="Delete note"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {note.title ? (
                    <h3 className="mt-3 text-sm font-semibold text-theme-ink truncate">{note.title}</h3>
                  ) : (
                    <div className="mt-3 flex items-center gap-1.5 text-theme-muted">
                      <IconNote className="w-3.5 h-3.5 opacity-60" />
                      <span className="text-xs">Untitled note</span>
                    </div>
                  )}

                  <p className="mt-2 text-[13px] leading-relaxed text-theme-muted line-clamp-4 whitespace-pre-wrap">
                    {note.content}
                  </p>

                  <p className="mt-3 text-[10px] text-zinc-500/70 dark:text-zinc-400/70">
                    Updated {formatDate(note.updatedAt ?? note.createdAt)}
                  </p>
                </article>
              )
            })}
          </div>
        )}
      </main>

      <p className="absolute bottom-2 right-4 text-[11px] text-theme-muted transition-colors hover:text-violet-500 dark:hover:text-violet-400">
        Made by Akshay
      </p>

      {formOpen && showingTasks && (
        <ChecklistForm onClose={closeForm} editList={editList} />
      )}
      {formOpen && !showingTasks && (
        <NoteForm onClose={closeForm} editNote={editNote} defaultType={defaultType} />
      )}
    </div>
  )
}
