import { ipcMain } from 'electron'
import {
  createNotebook,
  getAllNotebooks,
  getNotebookById,
  updateNotebook,
  deleteNotebook
} from '../db/queries'

/**
 * 注册笔记本相关的 IPC handlers
 */
export function registerNotebookHandlers() {
  // 创建笔记本
  ipcMain.handle('create-notebook', async (_event, title: string, description?: string) => {
    console.log('[IPC] create-notebook:', { title, description })
    try {
      const notebook = createNotebook(title, description)
      console.log('[IPC] Notebook created successfully:', notebook.id)
      return notebook
    } catch (error) {
      console.error('[IPC] Error creating notebook:', error)
      throw error
    }
  })

  // 获取所有笔记本
  ipcMain.handle('get-all-notebooks', async () => {
    console.log('[IPC] get-all-notebooks')
    try {
      const notebooks = getAllNotebooks()
      console.log(`[IPC] Retrieved ${notebooks.length} notebooks`)
      return notebooks
    } catch (error) {
      console.error('[IPC] Error getting notebooks:', error)
      throw error
    }
  })

  // 获取单个笔记本
  ipcMain.handle('get-notebook', async (_event, id: string) => {
    console.log('[IPC] get-notebook:', id)
    try {
      const notebook = getNotebookById(id)
      if (!notebook) {
        console.warn(`[IPC] Notebook not found: ${id}`)
      }
      return notebook
    } catch (error) {
      console.error('[IPC] Error getting notebook:', error)
      throw error
    }
  })

  // 更新笔记本
  ipcMain.handle('update-notebook', async (_event, id: string, updates: any) => {
    console.log('[IPC] update-notebook:', { id, updates })
    try {
      updateNotebook(id, updates)
      console.log('[IPC] Notebook updated successfully:', id)
      return { success: true }
    } catch (error) {
      console.error('[IPC] Error updating notebook:', error)
      throw error
    }
  })

  // 删除笔记本
  ipcMain.handle('delete-notebook', async (_event, id: string) => {
    console.log('[IPC] delete-notebook:', id)
    try {
      deleteNotebook(id)
      console.log('[IPC] Notebook deleted successfully:', id)
      return { success: true }
    } catch (error) {
      console.error('[IPC] Error deleting notebook:', error)
      throw error
    }
  })
}
