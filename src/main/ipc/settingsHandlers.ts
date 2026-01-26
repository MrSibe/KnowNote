import { ipcMain, BrowserWindow } from 'electron'
import { settingsManager, type AppSettings, defaultSettings } from '../config'
import { SettingsSchemas, validate } from './validation'

/**
 * 向所有窗口广播设置变化
 */
function broadcastSettingsChange(newSettings: AppSettings, oldSettings: AppSettings): void {
  BrowserWindow.getAllWindows().forEach((window) => {
    if (!window.isDestroyed()) {
      window.webContents.send('settings:changed', newSettings, oldSettings)
    }
  })
}

/**
 * 注册设置相关的 IPC Handlers
 */
export function registerSettingsHandlers(): void {
  // 获取所有设置
  ipcMain.handle('settings:getAll', async () => {
    return await settingsManager.getAllSettings()
  })

  // 获取单个设置（带参数验证）
  ipcMain.handle(
    'settings:get',
    validate(SettingsSchemas.get, async (args) => {
      return await settingsManager.getSetting(args.key as keyof AppSettings)
    })
  )

  // 更新设置（带参数验证）
  ipcMain.handle(
    'settings:update',
    validate(SettingsSchemas.update, async (args) => {
      await settingsManager.updateSettings(args.updates)
      return await settingsManager.getAllSettings()
    })
  )

  // 设置单个值（带参数验证）
  ipcMain.handle(
    'settings:set',
    validate(SettingsSchemas.set, async (args) => {
      await settingsManager.setSetting(args.key as keyof AppSettings, args.value)
      return await settingsManager.getSetting(args.key as keyof AppSettings)
    })
  )

  // 重置设置
  ipcMain.handle('settings:reset', async () => {
    await settingsManager.resetSettings()
    return await settingsManager.getAllSettings()
  })

  // 获取默认提示词
  ipcMain.handle('settings:getDefaultPrompts', async () => {
    return defaultSettings.prompts
  })

  // 监听设置变化并广播到所有窗口
  settingsManager.onSettingsChange((newSettings, oldSettings) => {
    console.log('[IPC] Settings changed, broadcasting to all windows')
    broadcastSettingsChange(newSettings, oldSettings)
  })

  console.log('[IPC] Settings handlers registered')
}
