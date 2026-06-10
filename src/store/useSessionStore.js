import { create } from 'zustand'

const useSessionStore = create((set) => ({
  easterEggUnlocked: false,
  unlockEasterEgg: () => set({ easterEggUnlocked: true }),
}))

export default useSessionStore
