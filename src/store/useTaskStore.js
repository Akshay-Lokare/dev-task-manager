import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

import { todayDateString } from '../utils/dates'

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

const getDoneTaskExpiryTime = (task) => {
  if (task.completedAt) {
    const completedAt = Date.parse(task.completedAt)
    if (!Number.isNaN(completedAt)) return completedAt
  }

  const updatedAt = Date.parse(task.updatedAt ?? '')
  if (!Number.isNaN(updatedAt)) return updatedAt

  const endValue = task.endDate ? Date.parse(`${task.endDate}T12:00:00`) : NaN
  if (!Number.isNaN(endValue)) return endValue

  return Date.now()
}

const applyStatusDates = (task, status) => {
  const next = { ...task, status }
  if (status === 'done') {
    next.endDate = todayDateString()
    next.completedAt = new Date().toISOString()
  } else if (task.status === 'done') {
    next.endDate = ''
    next.completedAt = ''
  }
  return next
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
      status: taskData.status ?? 'todo',
      type: taskData.type,           // 'sprint' | 'branch' | 'global'
      sprintName: taskData.sprintName?.trim() ?? '',
      branchName: taskData.branchName?.trim() ?? '',
      globalName: taskData.globalName?.trim() ?? '',
      assignedTo: taskData.assignedTo?.trim() ?? '',
      priority: taskData.priority ?? 'mid',
      tag: taskData.tag?.trim() ?? '',
      startDate: taskData.startDate?.trim() || todayDateString(),
      endDate: '',
      completedAt: '',
      notes: taskData.notes?.trim() ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const tasks = [task, ...get().tasks]
    set({ tasks })
    await persist(tasks)
    return task
  },

  updateTask: async (id, updates) => {
    const tasks = get().tasks.map((t) => {
      if (t.id !== id) return t
      const { endDate: _endDate, ...safeUpdates } = updates
      let next = { ...t, ...safeUpdates, updatedAt: new Date().toISOString() }
      if ('startDate' in updates) next.startDate = updates.startDate?.trim() ?? ''
      if ('status' in updates) next = applyStatusDates(next, updates.status)
      return next
    })
    set({ tasks })
    await persist(tasks)
  },

  toggleStatus: async (id) => {
    const tasks = get().tasks.map((t) => {
      if (t.id !== id) return t
      const status = t.status === 'todo' ? 'done' : 'todo'
      return { ...applyStatusDates(t, status), updatedAt: new Date().toISOString() }
    })
    set({ tasks })
    await persist(tasks)
  },

  setStatus: async (id, status) => {
    const tasks = get().tasks.map((t) =>
      t.id === id
        ? { ...applyStatusDates(t, status), updatedAt: new Date().toISOString() }
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
    const tasks = get().tasks.filter((task) => {
      if ((task.status ?? 'todo') !== 'done') return true
      return getDoneTaskExpiryTime(task) > cutoff
    })
    const removedCount = get().tasks.length - tasks.length

    if (removedCount > 0) {
      set({ tasks })
      await persist(tasks)
    }

    return removedCount
  },

  getByType: (type) => get().tasks.filter((t) => t.type === type),

  getContextLabels: (type) => {
    const fieldByType = {
      sprint: 'sprintName',
      branch: 'branchName',
      global: 'globalName',
    }
    const field = fieldByType[type]
    if (!field) return []

    return [...new Set(
      get().tasks
        .map((task) => task[field]?.trim())
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  },
}))

export default useTaskStore
