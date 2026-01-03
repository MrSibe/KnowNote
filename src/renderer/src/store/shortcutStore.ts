import { create } from 'zustand'
import { ShortcutConfig, ShortcutAction } from '../../../shared/types'

interface ShortcutStore {
  shortcuts: ShortcutConfig[]
  loadShortcuts: () => Promise<void>
  updateShortcut: (action: ShortcutAction, accelerator: string) => Promise<void>
  toggleShortcut: (action: ShortcutAction, enabled: boolean) => Promise<void>
  resetToDefaults: () => Promise<void>
  isConflict: (accelerator: string, excludeAction?: ShortcutAction) => boolean
}

export const useShortcutStore = create<ShortcutStore>((set, get) => ({
  shortcuts: [],

  loadShortcuts: async () => {
    const shortcuts = await window.electron.ipcRenderer.invoke('shortcuts:getAll')
    set({ shortcuts })
  },

  updateShortcut: async (action: ShortcutAction, accelerator: string) => {
    await window.electron.ipcRenderer.invoke('shortcuts:update', action, accelerator)
    await get().loadShortcuts()
  },

  toggleShortcut: async (action: ShortcutAction, enabled: boolean) => {
    await window.electron.ipcRenderer.invoke('shortcuts:toggle', action, enabled)
    await get().loadShortcuts()
  },

  resetToDefaults: async () => {
    await window.electron.ipcRenderer.invoke('shortcuts:reset')
    await get().loadShortcuts()
  },

  isConflict: (accelerator: string, excludeAction?: ShortcutAction) => {
    const { shortcuts } = get()
    return shortcuts.some(
      (s) => s.accelerator === accelerator && s.enabled && s.action !== excludeAction
    )
  }
}))
