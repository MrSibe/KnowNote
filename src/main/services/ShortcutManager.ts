import { Menu, BrowserWindow } from 'electron'
import type Store from 'electron-store'
import { ShortcutConfig, ShortcutAction } from '../../shared/types'
import { defaultShortcuts } from '../config/defaults'
import type { StoreSchema } from '../config/types'

/**
 * 快捷键管理器
 * 负责注册、注销和管理应用快捷键
 */
export class ShortcutManager {
  private store: Store<StoreSchema>
  private mainWindow: BrowserWindow | null = null
  private shortcuts: ShortcutConfig[] = []
  private keyboardHandler: ((event: Event, input: Electron.Input) => void) | null = null

  constructor(store: Store<StoreSchema>) {
    this.store = store
  }

  /**
   * 设置主窗口引用
   */
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window
  }

  /**
   * 注册快捷键使用 webContents 监听
   */
  registerShortcuts(): void {
    const shortcuts: ShortcutConfig[] = (this.store.get('shortcuts') as ShortcutConfig[]) || []

    if (shortcuts.length === 0) {
      console.warn('[ShortcutManager] No shortcuts found in store, using defaults')
      this.store.set('shortcuts', defaultShortcuts)
      this.registerShortcuts()
      return
    }

    this.shortcuts = shortcuts.filter((s) => s.enabled)

    if (!this.mainWindow) {
      console.error('[ShortcutManager] Main window not set!')
      return
    }

    // 移除旧的监听器
    if (this.keyboardHandler) {
      ;(this.mainWindow.webContents as any).removeListener('before-input-event', this.keyboardHandler)
    }

    // 创建新的处理器
    this.keyboardHandler = (event: Event, input: Electron.Input) => {
      this.handleKeyboardEvent(event, input)
    }

    // 等待 webContents ready 后再注册
    if (this.mainWindow.webContents.isLoading()) {
      this.mainWindow.webContents.once('did-finish-load', () => {
        ;(this.mainWindow!.webContents as any).on('before-input-event', this.keyboardHandler!)
      })
    } else {
      ;(this.mainWindow.webContents as any).on('before-input-event', this.keyboardHandler)
    }
  }

  /**
   * 处理键盘事件
   */
  private handleKeyboardEvent(event: Event, input: Electron.Input): void {
    // 只处理 keyDown 事件
    if (input.type !== 'keyDown') return

    // 构建当前按键组合
    const modifiers: string[] = []
    if (input.control || input.meta) modifiers.push('CommandOrControl')
    if (input.shift) modifiers.push('Shift')
    if (input.alt) modifiers.push('Alt')

    // 获取按键
    let key = input.key
    // 特殊键映射
    if (key === 'Enter') key = 'Enter'
    else if (key.length === 1) key = key.toUpperCase()

    const accelerator = modifiers.length > 0 ? [...modifiers, key].join('+') : key

    // 查找匹配的快捷键
    const matchedShortcut = this.shortcuts.find((s) => s.accelerator === accelerator)

    if (matchedShortcut) {
      // 阻止默认行为，避免系统快捷键冲突
      event.preventDefault()
      this.handleShortcut(matchedShortcut.action)
    }
  }

  /**
   * 注销所有快捷键
   */
  unregisterShortcuts(): void {
    // 清空菜单（移除所有快捷键）
    Menu.setApplicationMenu(null)
  }

  /**
   * 更新单个快捷键
   */
  updateShortcut(action: ShortcutAction, newAccelerator: string): void {
    const shortcuts: ShortcutConfig[] = (this.store.get('shortcuts') as ShortcutConfig[]) || []
    const index = shortcuts.findIndex((s) => s.action === action)

    if (index !== -1) {
      shortcuts[index].accelerator = newAccelerator
      this.store.set('shortcuts', shortcuts)
      this.registerShortcuts() // 重新注册
    }
  }

  /**
   * 切换快捷键的启用/禁用状态
   */
  toggleShortcut(action: ShortcutAction, enabled: boolean): void {
    const shortcuts: ShortcutConfig[] = (this.store.get('shortcuts') as ShortcutConfig[]) || []
    const index = shortcuts.findIndex((s) => s.action === action)

    if (index !== -1) {
      shortcuts[index].enabled = enabled
      this.store.set('shortcuts', shortcuts)
      this.registerShortcuts() // 重新注册
    }
  }

  /**
   * 重置为默认配置
   */
  resetToDefaults(): void {
    this.store.set('shortcuts', defaultShortcuts)
    this.registerShortcuts()
  }

  /**
   * 处理快捷键触发事件
   * 发送 IPC 事件到渲染进程
   */
  private handleShortcut(action: ShortcutAction): void {
    if (!this.mainWindow) {
      return
    }

    // 发送 IPC 事件到 Renderer Process
    this.mainWindow.webContents.send('shortcut:triggered', action)
  }
}
