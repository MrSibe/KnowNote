import { ipcMain } from 'electron'
import { createNote, getNotesByNotebook, getNoteById, updateNote, deleteNote } from '../db/queries'
import { ProviderManager } from '../providers/ProviderManager'

/**
 * 使用AI生成笔记标题
 */
async function generateNoteTitle(
  providerManager: ProviderManager,
  content: string
): Promise<string> {
  try {
    const provider = await providerManager.getActiveProvider()
    if (!provider) {
      return '未命名笔记'
    }

    let generatedTitle = ''

    await provider.sendMessageStream(
      [
        {
          role: 'system',
          content:
            '你是一个标题生成助手。请根据用户提供的内容生成一个简洁的标题，不超过20个字，不要使用引号或其他符号包裹。'
        },
        {
          role: 'user',
          content: `请为以下内容生成标题:\n\n${content.slice(0, 500)}`
        }
      ],
      (chunk) => {
        generatedTitle += chunk.content
      },
      (error) => {
        console.error('[generateNoteTitle] 生成标题失败:', error)
      },
      () => {
        // 完成
      }
    )

    return generatedTitle.trim() || '未命名笔记'
  } catch (error) {
    console.error('[generateNoteTitle] Error:', error)
    return '未命名笔记'
  }
}

/**
 * 注册笔记相关的 IPC handlers
 */
export function registerNoteHandlers(providerManager: ProviderManager) {
  // 创建笔记
  ipcMain.handle(
    'create-note',
    async (_event, notebookId: string, content: string, customTitle?: string) => {
      console.log('[IPC] create-note:', { notebookId, hasCustomTitle: !!customTitle })

      try {
        // 如果没有提供标题，使用AI生成
        const title = customTitle || (await generateNoteTitle(providerManager, content))
        const note = createNote(notebookId, title, content)
        console.log('[IPC] Note created successfully:', note.id)
        return note
      } catch (error) {
        console.error('[IPC] Error creating note:', error)
        throw error
      }
    }
  )

  // 获取笔记本的所有笔记
  ipcMain.handle('get-notes', async (_event, notebookId: string) => {
    console.log('[IPC] get-notes:', notebookId)
    try {
      const notes = getNotesByNotebook(notebookId)
      console.log(`[IPC] Retrieved ${notes.length} notes`)
      return notes
    } catch (error) {
      console.error('[IPC] Error getting notes:', error)
      throw error
    }
  })

  // 获取单个笔记
  ipcMain.handle('get-note', async (_event, id: string) => {
    console.log('[IPC] get-note:', id)
    try {
      const note = getNoteById(id)
      return note
    } catch (error) {
      console.error('[IPC] Error getting note:', error)
      throw error
    }
  })

  // 更新笔记
  ipcMain.handle('update-note', async (_event, id: string, updates: any) => {
    console.log('[IPC] update-note:', { id, updates })
    try {
      updateNote(id, updates)
      console.log('[IPC] Note updated successfully:', id)
      return { success: true }
    } catch (error) {
      console.error('[IPC] Error updating note:', error)
      throw error
    }
  })

  // 删除笔记
  ipcMain.handle('delete-note', async (_event, id: string) => {
    console.log('[IPC] delete-note:', id)
    try {
      deleteNote(id)
      console.log('[IPC] Note deleted successfully:', id)
      return { success: true }
    } catch (error) {
      console.error('[IPC] Error deleting note:', error)
      throw error
    }
  })
}
