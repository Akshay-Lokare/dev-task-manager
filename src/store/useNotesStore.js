import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

const STORE_KEY = 'contextNotes'

const persist = async (notes) => {
  if (window.electronStore) {
    await window.electronStore.set(STORE_KEY, notes)
  } else {
    localStorage.setItem(STORE_KEY, JSON.stringify(notes))
  }
}

const load = async () => {
  if (window.electronStore) {
    return (await window.electronStore.get(STORE_KEY)) ?? []
  }
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) ?? []
  } catch {
    return []
  }
}

const getNoteTime = (note) => {
  const value = Date.parse(note.updatedAt ?? note.createdAt ?? '')
  return Number.isNaN(value) ? 0 : value
}

const useNotesStore = create((set, get) => ({
  notes: [],
  loaded: false,

  loadNotes: async () => {
    try {
      const notes = await load()
      set({ notes, loaded: true })
    } catch (err) {
      console.error('Failed to load notes:', err)
      set({ notes: [], loaded: true })
    }
  },

  addNote: async (noteData) => {
    const note = {
      id: uuidv4(),
      type: noteData.type,
      contextName: noteData.contextName.trim(),
      title: noteData.title?.trim() ?? '',
      content: noteData.content?.trim() ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const notes = [note, ...get().notes]
    set({ notes })
    await persist(notes)
    return note
  },

  updateNote: async (id, updates) => {
    const notes = get().notes.map((note) =>
      note.id === id
        ? {
            ...note,
            ...updates,
            contextName: updates.contextName?.trim() ?? note.contextName,
            title: updates.title?.trim() ?? note.title,
            content: updates.content?.trim() ?? note.content,
            updatedAt: new Date().toISOString(),
          }
        : note
    )
    set({ notes })
    await persist(notes)
  },

  deleteNote: async (id) => {
    const notes = get().notes.filter((note) => note.id !== id)
    set({ notes })
    await persist(notes)
  },

  getSortedNotes: (typeFilter = 'all') => {
    const notes = get().notes.filter((note) => typeFilter === 'all' || note.type === typeFilter)
    return [...notes].sort((a, b) => getNoteTime(b) - getNoteTime(a))
  },
}))

export default useNotesStore
