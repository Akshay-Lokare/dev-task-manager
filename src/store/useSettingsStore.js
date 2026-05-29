import { create } from 'zustand'

const SETTINGS_KEY = 'settings'

export const DEFAULT_COLUMN_LABELS = {
  sprint: 'Sprint',
  branch: 'Branch',
  global: 'Global',
}

const DEFAULT_SETTINGS = {
  autoDeleteHours: 6,
  columnLabels: DEFAULT_COLUMN_LABELS,
}

const readLocalSettings = () => {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) ?? {}
  } catch {
    return {}
  }
}

const normalizeColumnLabels = (labels) => ({
  sprint: labels?.sprint?.trim() || DEFAULT_COLUMN_LABELS.sprint,
  branch: labels?.branch?.trim() || DEFAULT_COLUMN_LABELS.branch,
  global: labels?.global?.trim() || DEFAULT_COLUMN_LABELS.global,
})

const normalizeSettings = (settings) => ({
  ...DEFAULT_SETTINGS,
  ...settings,
  autoDeleteHours: Math.max(0, Number(settings?.autoDeleteHours ?? DEFAULT_SETTINGS.autoDeleteHours) || 0),
  columnLabels: normalizeColumnLabels(settings?.columnLabels),
})

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
    const settings = normalizeSettings({
      ...get().settings,
      autoDeleteHours,
    })
    set({ settings })
    await persistSettings(settings)
  },

  setColumnLabels: async (columnLabels) => {
    const settings = normalizeSettings({
      ...get().settings,
      columnLabels,
    })
    set({ settings })
    await persistSettings(settings)
  },
}))

export default useSettingsStore
