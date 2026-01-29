import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { settingsManager } from '../config'

let ankiWindow: BrowserWindow | null = null

/**
 * 创建Anki卡片窗口
 * @param notebookId - 笔记本 ID（用于生成新卡片）
 * @param ankiCardId - Anki卡片集 ID（用于查看特定版本，可选）
 */
export function createAnkiWindow(notebookId: string, ankiCardId?: string): void {
  // 如果Anki窗口已经存在，则聚焦并返回
  if (ankiWindow && !ankiWindow.isDestroyed()) {
    ankiWindow.focus()
    // 如果传入了新的路由参数，更新 URL
    const route = ankiCardId ? `/anki/view/${ankiCardId}` : `/anki/${notebookId}`
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      ankiWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#${route}`)
    } else {
      ankiWindow.loadFile(join(__dirname, '../renderer/index.html'), {
        hash: route
      })
    }
    return
  }

  // 根据用户主题设置背景色
  const theme = settingsManager.getSettingSync('theme')
  const backgroundColor = theme === 'dark' ? '#1a1b1e' : '#fafafa'

  // 创建Anki卡片窗口
  ankiWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    // Position macOS traffic lights (window controls)
    ...(process.platform === 'darwin' ? { trafficLightPosition: { x: 16, y: 16 } } : {}),
    ...(process.platform !== 'darwin'
      ? { titleBarOverlay: { color: 'rgba(0,0,0,0)', height: 35, symbolColor: 'white' } }
      : {}),
    backgroundColor,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  ankiWindow.on('ready-to-show', () => {
    ankiWindow?.show()
  })

  ankiWindow.on('closed', () => {
    ankiWindow = null
  })

  // 监听主题变化
  settingsManager.onSettingsChangeSync((newSettings) => {
    if (ankiWindow && !ankiWindow.isDestroyed()) {
      const newBackgroundColor = newSettings.theme === 'dark' ? '#1a1b1e' : '#fafafa'
      ankiWindow.setBackgroundColor(newBackgroundColor)
    }
  })

  // 加载Anki卡片页面
  const route = ankiCardId ? `/anki/view/${ankiCardId}` : `/anki/${notebookId}`
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    ankiWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#${route}`)
  } else {
    ankiWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: route
    })
  }
}

/**
 * 获取Anki窗口实例
 */
export function getAnkiWindow(): BrowserWindow | null {
  return ankiWindow
}

/**
 * 销毁Anki窗口
 */
export function destroyAnkiWindow(): void {
  if (ankiWindow && !ankiWindow.isDestroyed()) {
    ankiWindow.destroy()
    ankiWindow = null
  }
}
