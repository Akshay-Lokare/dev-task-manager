import { create } from 'zustand'
import { TYPE_THEME } from '../constants/typeTheme'
import { getTypeLabelsForMode, getTaskTagsForMode, normalizeUserMode } from '../constants/userMode'

const SETTINGS_KEY = 'settings'

export const DEFAULT_COLUMN_LABELS = {
  todo: 'Todo',
  inprogress: 'Inprogress',
  done: 'Completed',
}

export const DEFAULT_TYPE_LABELS = {
  sprint: TYPE_THEME.sprint.label,
  branch: TYPE_THEME.branch.label,
  global: TYPE_THEME.global.label,
}

const DEFAULT_SETTINGS = {
  autoDeleteHours: 6,
  columnLabels: DEFAULT_COLUMN_LABELS,
  typeLabels: DEFAULT_TYPE_LABELS,
  taskTags: getTaskTagsForMode('dev'),
  userMode: 'dev',
}

const readLocalSettings = () => {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) ?? {}
  } catch {
    return {}
  }
}

const normalizeColumnLabels = (labels) => ({
  todo: labels?.todo?.trim() || DEFAULT_COLUMN_LABELS.todo,
  inprogress: labels?.inprogress?.trim() || DEFAULT_COLUMN_LABELS.inprogress,
  done: labels?.done?.trim() || DEFAULT_COLUMN_LABELS.done,
})

const normalizeTypeLabels = (labels) => ({
  sprint: labels?.sprint?.trim() || DEFAULT_TYPE_LABELS.sprint,
  branch: labels?.branch?.trim() || DEFAULT_TYPE_LABELS.branch,
  global: labels?.global?.trim() || DEFAULT_TYPE_LABELS.global,
})

const normalizeTaskTags = (tags, userMode) => {
  const defaults = getTaskTagsForMode(userMode)
  if (!Array.isArray(tags)) return defaults
  const cleaned = tags.map((tag) => tag?.trim()).filter(Boolean)
  return cleaned.length > 0 ? cleaned : defaults
}

const normalizeSettings = (settings) => {
  const userMode = normalizeUserMode(settings?.userMode)
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    autoDeleteHours: Math.max(0, Number(settings?.autoDeleteHours ?? DEFAULT_SETTINGS.autoDeleteHours) || 0),
    columnLabels: normalizeColumnLabels(settings?.columnLabels),
    typeLabels: normalizeTypeLabels(settings?.typeLabels),
    taskTags: normalizeTaskTags(settings?.taskTags, userMode),
    userMode,
  }
}

const persistSettings = async (settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  if (window.electronStore) {
    await window.electronStore.set(SETTINGS_KEY, settings)
  }
}

const loadSettings = async () => {
  let settings = readLocalSettings()

  if (window.electronStore) {
    const stored = await window.electronStore.get(SETTINGS_KEY)
    if (stored) settings = stored
  }

  return normalizeSettings(settings)
}

const useSettingsStore = create((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,

  loadSettings: async () => {
    const settings = await loadSettings()
    set({ settings, loaded: true })
    await persistSettings(settings)
  },

  setAutoDeleteHours: async (autoDeleteHours) => {
    const settings = normalizeSettings({ ...get().settings, autoDeleteHours })
    set({ settings })
    await persistSettings(settings)
  },

  setColumnLabels: async (columnLabels) => {
    const settings = normalizeSettings({ ...get().settings, columnLabels })
    set({ settings })
    await persistSettings(settings)
  },

  setTypeLabel: async (type, label) => {
    const typeLabels = {
      ...get().settings.typeLabels,
      [type]: label,
    }
    const settings = normalizeSettings({ ...get().settings, typeLabels })
    set({ settings })
    await persistSettings(settings)
  },

  resetTypeLabels: async () => {
    const userMode = normalizeUserMode(get().settings.userMode)
    const settings = normalizeSettings({
      ...get().settings,
      typeLabels: getTypeLabelsForMode(userMode),
    })
    set({ settings })
    await persistSettings(settings)
  },

  setTaskTags: async (taskTags) => {
    const userMode = normalizeUserMode(get().settings.userMode)
    const settings = normalizeSettings({ ...get().settings, taskTags })
    set({ settings })
    await persistSettings(settings)
  },

  setTaskTagAt: async (index, value) => {
    const userMode = normalizeUserMode(get().settings.userMode)
    const defaults = getTaskTagsForMode(userMode)
    const taskTags = [...get().settings.taskTags]
    taskTags[index] = value.trim() || defaults[index] || ''
    const settings = normalizeSettings({ ...get().settings, taskTags })
    set({ settings })
    await persistSettings(settings)
  },

  addTaskTag: async () => {
    const taskTags = [...get().settings.taskTags, 'New tag']
    const settings = normalizeSettings({ ...get().settings, taskTags })
    set({ settings })
    await persistSettings(settings)
  },

  removeTaskTagAt: async (index) => {
    const taskTags = get().settings.taskTags.filter((_, i) => i !== index)
    const settings = normalizeSettings({ ...get().settings, taskTags })
    set({ settings })
    await persistSettings(settings)
  },

  resetTaskTags: async () => {
    const userMode = normalizeUserMode(get().settings.userMode)
    const settings = normalizeSettings({
      ...get().settings,
      taskTags: getTaskTagsForMode(userMode),
    })
    set({ settings })
    await persistSettings(settings)
  },

  setUserMode: async (userMode) => {
    const mode = normalizeUserMode(userMode)
    const settings = normalizeSettings({
      ...get().settings,
      userMode: mode,
      typeLabels: getTypeLabelsForMode(mode),
      taskTags: getTaskTagsForMode(mode),
    })
    set({ settings })
    await persistSettings(settings)
  },
}))

export default useSettingsStore
