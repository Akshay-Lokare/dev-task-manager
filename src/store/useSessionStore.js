import { create } from 'zustand'
import { TYPE_THEME } from '../constants/typeTheme'

export const DEFAULT_TYPE_LABELS = {
  sprint: TYPE_THEME.sprint.label,
  branch: TYPE_THEME.branch.label,
  global: TYPE_THEME.global.label,
}

const useSessionStore = create((set) => ({
  easterEggUnlocked: false,
  typeLabels: { ...DEFAULT_TYPE_LABELS },

  unlockEasterEgg: () => set({ easterEggUnlocked: true }),

  setTypeLabel: (type, label) => set((state) => ({
    typeLabels: {
      ...state.typeLabels,
      [type]: label,
    },
  })),

  resetTypeLabels: () => set({ typeLabels: { ...DEFAULT_TYPE_LABELS } }),
}))

export default useSessionStore
