import { app, BrowserWindow, ipcMain } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { initDatabase, runMigrations, closeDatabase, executeCheckpoint } from './db'
import { ProviderManager } from './providers/ProviderManager'
import { SessionAutoSwitchService } from './services/SessionAutoSwitchService'
import { createMainWindow, createSettingsWindow, destroySettingsWindow } from './windows'
import { registerAllHandlers } from './ipc'

let providerManager: ProviderManager | null = null
let sessionAutoSwitchService: SessionAutoSwitchService | null = null
let isQuitting = false // 标记应用是否正在退出

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 初始化数据库
  console.log('[Main] 初始化数据库...')
  initDatabase()
  runMigrations()
  console.log('[Main] 数据库初始化完成')

  // 初始化 Provider Manager
  console.log('[Main] 初始化 Provider Manager...')
  providerManager = new ProviderManager()
  console.log('[Main] Provider Manager 初始化完成')

  // 初始化 Session 自动切换服务
  console.log('[Main] 初始化 Session 自动切换服务...')
  sessionAutoSwitchService = new SessionAutoSwitchService(providerManager)
  console.log('[Main] Session 自动切换服务初始化完成')

  // 注册所有 IPC Handlers
  registerAllHandlers(providerManager, sessionAutoSwitchService)

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // 处理打开设置窗口的请求
  ipcMain.handle('open-settings', () => {
    createSettingsWindow()
  })

  // 创建主窗口
  createMainWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

// 处理窗口全部关闭事件
app.on('window-all-closed', () => {
  console.log('[Main] All windows closed')

  if (process.platform === 'darwin') {
    // macOS 特殊处理：窗口关闭但应用不退出时，执行 checkpoint 保护数据
    console.log('[Main] macOS: Executing checkpoint on window close...')
    executeCheckpoint('PASSIVE')

    // 可选：如果希望 macOS 上关闭窗口也退出应用，取消下面的注释
    // app.quit()
  } else {
    // 其他平台：窗口关闭即退出应用
    app.quit()
  }
})

// 第一道防线：before-quit 事件（用户主动退出）
app.on('before-quit', () => {
  if (isQuitting) return

  console.log('[Main] before-quit event triggered')

  isQuitting = true
  destroySettingsWindow()

  console.log('[Main] 关闭数据库连接...')
  closeDatabase()
})

// 第二道防线：will-quit 事件（备份）
app.on('will-quit', () => {
  if (!isQuitting) {
    console.log('[Main] will-quit event triggered (backup)')
    closeDatabase()
  }
})

// 第三道防线：进程信号处理（强制退出、系统关闭）
const handleShutdown = (signal: string) => {
  console.log(`[Main] Received ${signal}, shutting down gracefully...`)

  if (!isQuitting) {
    isQuitting = true
    closeDatabase()
  }

  // 给数据库 2 秒时间完成关闭
  setTimeout(() => {
    process.exit(0)
  }, 2000)
}

process.on('SIGINT', () => handleShutdown('SIGINT'))
process.on('SIGTERM', () => handleShutdown('SIGTERM'))
process.on('SIGHUP', () => handleShutdown('SIGHUP'))

// 未捕获异常处理
process.on('uncaughtException', (error) => {
  console.error('[Main] Uncaught exception:', error)
  closeDatabase()
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('[Main] Unhandled rejection:', reason)
})
