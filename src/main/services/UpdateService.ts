import { autoUpdater, UpdateInfo } from 'electron-updater'
import { BrowserWindow } from 'electron'
import Logger from '../../shared/utils/logger'
import { UpdateStatus, UpdateState } from '../../shared/types/update'

/**
 * 自动更新服务
 */
export class UpdateService {
  private currentState: UpdateState = { status: UpdateStatus.IDLE }
  private mainWindow: BrowserWindow | null = null

  constructor() {
    this.setupAutoUpdater()
  }

  /**
   * 设置主窗口引用（用于发送更新通知）
   */
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window
  }

  /**
   * 配置 electron-updater
   */
  private setupAutoUpdater(): void {
    // 开发环境配置
    if (process.env.NODE_ENV === 'development') {
      Logger.info('UpdateService', 'Running in development mode, auto-update disabled')
      autoUpdater.autoDownload = false
      autoUpdater.autoInstallOnAppQuit = false
      return
    }

    // 生产环境配置
    autoUpdater.autoDownload = false // 不自动下载，让用户选择
    autoUpdater.autoInstallOnAppQuit = true // 退出时自动安装

    // 设置更新源（已在 electron-builder.yml 中配置）
    Logger.info('UpdateService', 'Auto-updater configured')

    // 监听更新事件
    this.registerUpdateListeners()
  }

  /**
   * 注册更新事件监听器
   */
  private registerUpdateListeners(): void {
    // 检查更新出错
    autoUpdater.on('error', (error) => {
      Logger.error('UpdateService', 'Update error:', error)
      this.updateState({
        status: UpdateStatus.ERROR,
        error: error.message
      })
    })

    // 开始检查更新
    autoUpdater.on('checking-for-update', () => {
      Logger.info('UpdateService', 'Checking for updates...')
      this.updateState({ status: UpdateStatus.CHECKING })
    })

    // 发现新版本
    autoUpdater.on('update-available', (info: UpdateInfo) => {
      Logger.info('UpdateService', 'Update available:', info.version)
      this.updateState({
        status: UpdateStatus.AVAILABLE,
        info
      })
    })

    // 当前已是最新版本
    autoUpdater.on('update-not-available', (info: UpdateInfo) => {
      Logger.info('UpdateService', 'Update not available, current version is latest')
      this.updateState({
        status: UpdateStatus.NOT_AVAILABLE,
        info
      })
    })

    // 下载进度
    autoUpdater.on('download-progress', (progressObj) => {
      Logger.debug('UpdateService', `Download progress: ${progressObj.percent.toFixed(2)}%`)
      this.updateState({
        status: UpdateStatus.DOWNLOADING,
        progress: {
          percent: progressObj.percent,
          transferred: progressObj.transferred,
          total: progressObj.total
        }
      })
    })

    // 下载完成
    autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
      Logger.info('UpdateService', 'Update downloaded:', info.version)
      this.updateState({
        status: UpdateStatus.DOWNLOADED,
        info
      })
    })
  }

  /**
   * 更新状态并通知渲染进程
   */
  private updateState(newState: Partial<UpdateState>): void {
    this.currentState = { ...this.currentState, ...newState }

    // 通知渲染进程
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('update:state-changed', this.currentState)
    }
  }

  /**
   * 检查更新
   */
  async checkForUpdates(): Promise<UpdateState> {
    if (process.env.NODE_ENV === 'development') {
      Logger.warn('UpdateService', 'Auto-update is disabled in development mode')
      return {
        status: UpdateStatus.ERROR,
        error: 'Auto-update is not available in development mode'
      }
    }

    try {
      Logger.info('UpdateService', 'Manually checking for updates...')
      await autoUpdater.checkForUpdates()
      return this.currentState
    } catch (error: any) {
      Logger.error('UpdateService', 'Failed to check for updates:', error)
      this.updateState({
        status: UpdateStatus.ERROR,
        error: error.message
      })
      return this.currentState
    }
  }

  /**
   * 下载更新
   */
  async downloadUpdate(): Promise<void> {
    if (this.currentState.status !== UpdateStatus.AVAILABLE) {
      throw new Error('No update available to download')
    }

    try {
      Logger.info('UpdateService', 'Starting update download...')
      await autoUpdater.downloadUpdate()
    } catch (error: any) {
      Logger.error('UpdateService', 'Failed to download update:', error)
      this.updateState({
        status: UpdateStatus.ERROR,
        error: error.message
      })
      throw error
    }
  }

  /**
   * 退出并安装更新
   */
  quitAndInstall(): void {
    if (this.currentState.status !== UpdateStatus.DOWNLOADED) {
      throw new Error('No update downloaded to install')
    }

    Logger.info('UpdateService', 'Quitting and installing update...')
    // isSilent: 静默安装，不弹出安装程序窗口
    // isForceRunAfter: 安装后强制运行应用
    autoUpdater.quitAndInstall(false, true)
  }

  /**
   * 获取当前更新状态
   */
  getState(): UpdateState {
    return { ...this.currentState }
  }

  /**
   * 应用启动时自动检查更新（可选）
   */
  async checkForUpdatesOnStartup(): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      return
    }

    // 延迟 5 秒后检查更新，避免影响应用启动速度
    setTimeout(() => {
      this.checkForUpdates().catch((error) => {
        Logger.error('UpdateService', 'Startup update check failed:', error)
      })
    }, 5000)
  }
}
