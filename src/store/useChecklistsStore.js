import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

const STORE_KEY = 'noteChecklists'

const persist = async (checklists) => {
  if (window.electronStore) {
    await window.electronStore.set(STORE_KEY, checklists)
  } else {
    localStorage.setItem(STORE_KEY, JSON.stringify(checklists))
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

const normalizeItems = (items = []) =>
  items
    .map((item) => ({
      id: item.id || uuidv4(),
      text: (item.text ?? '').trim(),
      done: Boolean(item.done),
    }))
    .filter((item) => item.text)

const useChecklistsStore = create((set, get) => ({
  checklists: [],
  loaded: false,

  loadChecklists: async () => {
    try {
      const stored = await load()
      const checklists = (Array.isArray(stored) ? stored : []).map((list) => ({
        ...list,
        items: Array.isArray(list.items) ? list.items : [],
      }))
      set({ checklists, loaded: true })
    } catch (err) {
      console.error('Failed to load checklists:', err)
      set({ checklists: [], loaded: true })
    }
  },

  addChecklist: async (data) => {
    const checklist = {
      id: uuidv4(),
      sprintName: data.sprintName.trim(),
      title: data.title?.trim() ?? '',
      items: normalizeItems(data.items),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const checklists = [checklist, ...get().checklists]
    set({ checklists })
    await persist(checklists)
    return checklist
  },

  updateChecklist: async (id, updates) => {
    const checklists = get().checklists.map((checklist) =>
      checklist.id === id
        ? {
            ...checklist,
            ...updates,
            sprintName: updates.sprintName?.trim() ?? checklist.sprintName,
            title: updates.title?.trim() ?? checklist.title,
            items: updates.items ? normalizeItems(updates.items) : checklist.items,
            updatedAt: new Date().toISOString(),
          }
        : checklist
    )
    set({ checklists })
    await persist(checklists)
  },

  toggleChecklistItem: async (id, itemId) => {
    const checklists = get().checklists.map((checklist) =>
      checklist.id === id
        ? {
            ...checklist,
            items: checklist.items.map((item) =>
              item.id === itemId ? { ...item, done: !item.done } : item
            ),
          }
        : checklist
    )
    set({ checklists })
    await persist(checklists)
  },

  deleteChecklist: async (id) => {
    const checklists = get().checklists.filter((checklist) => checklist.id !== id)
    set({ checklists })
    await persist(checklists)
  },
}))

export default useChecklistsStore
