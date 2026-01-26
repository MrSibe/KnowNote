import { create } from 'zustand'

interface UIStore {
  isSettingsOpen: boolean
  openSettings: () => void
  closeSettings: () => void
}

export const useUIStore = create<UIStore>()((set) => ({
  isSettingsOpen: false,
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false })
}))
