import { ipcMain, dialog, BrowserWindow } from 'electron'

/**
 * 注册系统对话框相关的 IPC Handlers
 */
export function registerDialogHandlers() {
  // 保存文件对话框
  ipcMain.handle(
    'dialog:saveFile',
    async (
      _,
      options: {
        title?: string
        defaultPath?: string
        filters?: { name: string; extensions: string[] }[]
      } = {}
    ) => {
      const win = BrowserWindow.getFocusedWindow()

      if (!win) {
        return null
      }

      try {
        const result = await dialog.showSaveDialog(win, {
          title: options.title || 'Save File',
          defaultPath: options.defaultPath,
          filters: options.filters || []
        })

        return result.canceled ? null : result.filePath
      } catch (error) {
        console.error('dialog:saveFile error:', error)
        return null
      }
    }
  )

  console.log('[IPC] Dialog handlers registered')
}
