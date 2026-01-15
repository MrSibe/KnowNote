import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { settingsManager } from '../config'

let settingsWindow: BrowserWindow | null = null

/**
 * 创建设置窗口
 */
export function createSettingsWindow(): void {
  // 如果设置窗口已经存在，则聚焦并返回
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus()
    return
  }

  // 根据用户主题设置背景色，避免窗口调整大小时出现白边
  const theme = settingsManager.getSettingSync('theme')
  const backgroundColor = theme === 'dark' ? '#282c34' : '#fafafa'

  // 创建设置窗口
  settingsWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    // remove the default titlebar
    titleBarStyle: 'hidden',
    // Position macOS traffic lights (window controls)
    ...(process.platform === 'darwin' ? { trafficLightPosition: { x: 16, y: 16 } } : {}),
    // expose window controls in Windows/Linux
    ...(process.platform !== 'darwin'
      ? { titleBarOverlay: { color: 'rgba(0,0,0,0)', height: 35, symbolColor: 'white' } }
      : {}),
    backgroundColor,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  settingsWindow.on('ready-to-show', () => {
    settingsWindow?.show()
  })

  settingsWindow.on('closed', () => {
    settingsWindow = null
  })

  // 监听主题变化，动态更新窗口背景色
  settingsManager.onSettingsChangeSync((newSettings) => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      const newBackgroundColor = newSettings.theme === 'dark' ? '#282c34' : '#fafafa'
      settingsWindow.setBackgroundColor(newBackgroundColor)
    }
  })

  // 加载设置页面
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    settingsWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/settings`)
  } else {
    settingsWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: '/settings'
    })
  }
}

/**
 * 获取设置窗口实例
 */
export function getSettingsWindow(): BrowserWindow | null {
  return settingsWindow
}

/**
 * 销毁设置窗口
 */
export function destroySettingsWindow(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.destroy()
    settingsWindow = null
  }
}
