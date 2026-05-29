import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

const STORE_KEY = 'tasks'

const persist = async (tasks) => {
  if (window.electronStore) {
    await window.electronStore.set(STORE_KEY, tasks)
  } else {
    localStorage.setItem(STORE_KEY, JSON.stringify(tasks))
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

const getTaskTime = (task) => {
  const value = Date.parse(task.createdAt ?? task.updatedAt ?? '')
  return Number.isNaN(value) ? Date.now() : value
}

const useTaskStore = create((set, get) => ({
  tasks: [],
  loaded: false,

  loadTasks: async () => {
    try {
      const tasks = await load()
      set({ tasks, loaded: true })
    } catch (err) {
      console.error('Failed to load tasks:', err)
      set({ tasks: [], loaded: true })
    }
  },

  addTask: async (taskData) => {
    const task = {
      id: uuidv4(),
      title: taskData.title.trim(),
      description: taskData.description?.trim() ?? '',
      status: 'todo',
      type: taskData.type,           // 'sprint' | 'branch' | 'global'
      sprintName: taskData.sprintName?.trim() ?? '',
      branchName: taskData.branchName?.trim() ?? '',
      assignedTo: taskData.assignedTo?.trim() ?? '',
      notes: taskData.notes?.trim() ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const tasks = [...get().tasks, task]
    set({ tasks })
    await persist(tasks)
    return task
  },

  updateTask: async (id, updates) => {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    )
    set({ tasks })
    await persist(tasks)
  },

  toggleStatus: async (id) => {
    const tasks = get().tasks.map((t) =>
      t.id === id
        ? { ...t, status: t.status === 'todo' ? 'done' : 'todo', updatedAt: new Date().toISOString() }
        : t
    )
    set({ tasks })
    await persist(tasks)
  },

  updateNotes: async (id, notes) => {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, notes, updatedAt: new Date().toISOString() } : t
    )
    set({ tasks })
    await persist(tasks)
  },

  deleteTask: async (id) => {
    const tasks = get().tasks.filter((t) => t.id !== id)
    set({ tasks })
    await persist(tasks)
  },

  deleteExpiredTasks: async (autoDeleteHours) => {
    const hours = Number(autoDeleteHours)
    if (!hours || hours <= 0) return 0

    const cutoff = Date.now() - hours * 60 * 60 * 1000
    const tasks = get().tasks.filter((task) => getTaskTime(task) > cutoff)
    const removedCount = get().tasks.length - tasks.length

    if (removedCount > 0) {
      set({ tasks })
      await persist(tasks)
    }

    return removedCount
  },

  getByType: (type) => get().tasks.filter((t) => t.type === type),

  getContextLabels: (type) => {
    const tasks = get().tasks.filter((t) => t.type === type)
    if (type === 'sprint') {
      return [...new Set(tasks.map((t) => t.sprintName).filter(Boolean))]
    }
    if (type === 'branch') {
      return [...new Set(tasks.map((t) => t.branchName).filter(Boolean))]
    }
    return []
  },
}))

export default useTaskStore
