import { ipcMain } from 'electron'
import type Store from 'electron-store'
import { ShortcutConfig, ShortcutAction } from '../../shared/types'
import { ShortcutManager } from '../services/ShortcutManager'
import type { StoreSchema } from '../config/types'

/**
 * 注册快捷键相关的 IPC Handlers
 */
export function registerShortcutHandlers(shortcutManager: ShortcutManager, store: Store<StoreSchema>): void {
  // 获取所有快捷键
  ipcMain.handle('shortcuts:getAll', (): ShortcutConfig[] => {
    return (store.get('shortcuts') as ShortcutConfig[]) || []
  })

  // 更新快捷键
  ipcMain.handle(
    'shortcuts:update',
    (_event, action: ShortcutAction, accelerator: string): void => {
      shortcutManager.updateShortcut(action, accelerator)
    }
  )

  // 切换快捷键的启用/禁用状态
  ipcMain.handle('shortcuts:toggle', (_event, action: ShortcutAction, enabled: boolean): void => {
    shortcutManager.toggleShortcut(action, enabled)
  })

  // 重置单个快捷键为默认值
  ipcMain.handle('shortcuts:resetSingle', (_event, action: ShortcutAction): void => {
    shortcutManager.resetSingle(action)
  })

  // 重置为默认配置
  ipcMain.handle('shortcuts:reset', (): void => {
    shortcutManager.resetToDefaults()
  })

  console.log('[IPC] Shortcut handlers registered')
}
