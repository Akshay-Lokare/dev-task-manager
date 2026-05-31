import React, { useEffect, useMemo, useState } from 'react'
import useNotesStore from '../store/useNotesStore'
import useTaskStore from '../store/useTaskStore'
import useThemeStore from '../store/useThemeStore'
import NoteForm from './NoteForm'
import AppHeader from './AppHeader'
import { IconEmpty, IconLoading, IconNote, IconPlus, IconTrash, TYPE_ICONS } from './Icons'
import { TYPE_THEME } from '../constants/typeTheme'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'sprint', label: 'Sprint' },
  { id: 'branch', label: 'Branch' },
]

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function NotesPage({ onNavigate }) {
  const { loadNotes, loaded, deleteNote, notes } = useNotesStore()
  const loadTasks = useTaskStore((s) => s.loadTasks)
  const tasksLoaded = useTaskStore((s) => s.loaded)
  const { theme, toggleTheme } = useThemeStore()
  const [filter, setFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editNote, setEditNote] = useState(null)
  const [defaultType, setDefaultType] = useState('sprint')

  useEffect(() => {
    loadNotes()
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

  const openAdd = (type = 'sprint') => {
    setEditNote(null)
    setDefaultType(type)
    setFormOpen(true)
  }

  const openEdit = (note) => {
    setEditNote(note)
    setDefaultType(note.type)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditNote(null)
  }

  if (!loaded) {
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
        subtitle={`${notes.length} ${notes.length === 1 ? 'note' : 'notes'} for sprints and branches`}
        theme={theme}
        onToggleTheme={toggleTheme}
        actions={(
          <button
            onClick={() => openAdd(filter === 'branch' ? 'branch' : 'sprint')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg btn-primary text-xs font-medium"
          >
            <IconPlus className="w-4 h-4" />
            New note
          </button>
        )}
      />

      <div className="px-8 py-4 border-b border-theme surface-panel border-x-0">
        <div className="flex gap-2">
          {FILTERS.map(({ id, label }) => {
            const active = filter === id
            const theme = id === 'all' ? null : TYPE_THEME[id]
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${active
                    ? id === 'all'
                      ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 ring-1 ring-violet-500/20'
                      : theme.activeFilter
                    : 'btn-ghost'}`}
              >
                {id !== 'all' && TYPE_ICONS[id] && React.createElement(TYPE_ICONS[id], { className: 'w-3.5 h-3.5' })}
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-8 py-6 min-h-0">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <IconEmpty className="w-12 h-12 text-theme-muted/30 mb-3" />
            <p className="text-sm text-theme-muted">No notes yet</p>
            <p className="text-xs text-theme-muted/70 mt-1 max-w-xs">
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
              const theme = TYPE_THEME[note.type]
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

                  <p className="mt-3 text-[10px] text-theme-muted/70">
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

      {formOpen && (
        <NoteForm onClose={closeForm} editNote={editNote} defaultType={defaultType} />
      )}
    </div>
  )
}
