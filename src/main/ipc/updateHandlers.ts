import { ipcMain } from 'electron'
import { UpdateService } from '../services/UpdateService'
import Logger from '../../shared/utils/logger'

/**
 * 注册更新相关的 IPC Handlers
 */
export function registerUpdateHandlers(updateService: UpdateService): void {
  // 检查更新
  ipcMain.handle('update:check', async () => {
    try {
      Logger.info('UpdateHandlers', 'Checking for updates...')
      const state = await updateService.checkForUpdates()
      return { success: true, state }
    } catch (error: any) {
      Logger.error('UpdateHandlers', 'Failed to check for updates:', error)
      return { success: false, error: error.message }
    }
  })

  // 下载更新
  ipcMain.handle('update:download', async () => {
    try {
      Logger.info('UpdateHandlers', 'Downloading update...')
      await updateService.downloadUpdate()
      return { success: true }
    } catch (error: any) {
      Logger.error('UpdateHandlers', 'Failed to download update:', error)
      return { success: false, error: error.message }
    }
  })

  // 安装更新（退出并安装）
  ipcMain.handle('update:install', async () => {
    try {
      Logger.info('UpdateHandlers', 'Installing update...')
      updateService.quitAndInstall()
      return { success: true }
    } catch (error: any) {
      Logger.error('UpdateHandlers', 'Failed to install update:', error)
      return { success: false, error: error.message }
    }
  })

  // 获取当前更新状态
  ipcMain.handle('update:get-state', async () => {
    try {
      const state = updateService.getState()
      return { success: true, state }
    } catch (error: any) {
      Logger.error('UpdateHandlers', 'Failed to get update state:', error)
      return { success: false, error: error.message }
    }
  })

  Logger.info('UpdateHandlers', 'Update handlers registered')
}
