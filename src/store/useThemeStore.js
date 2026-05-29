import { create } from 'zustand'

const THEME_KEY = 'theme'

const applyTheme = (theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  localStorage.setItem(THEME_KEY, theme)
}

const persistTheme = async (theme) => {
  localStorage.setItem(THEME_KEY, theme)
  if (window.electronStore) {
    await window.electronStore.set(THEME_KEY, theme)
  }
}

const loadTheme = async () => {
  let theme = localStorage.getItem(THEME_KEY)

  if (window.electronStore) {
    const stored = await window.electronStore.get(THEME_KEY)
    if (stored) theme = stored
  }

  return theme === 'dark' ? 'dark' : 'light'
}

const useThemeStore = create((set, get) => ({
  theme: 'light',
  loaded: false,

  loadTheme: async () => {
    const theme = await loadTheme()
    applyTheme(theme)
    set({ theme, loaded: true })
  },

  toggleTheme: async () => {
    const theme = get().theme === 'light' ? 'dark' : 'light'
    applyTheme(theme)
    set({ theme })
    await persistTheme(theme)
  },
}))

export default useThemeStore
