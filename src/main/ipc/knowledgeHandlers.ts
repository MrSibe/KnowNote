/**
 * Knowledge IPC Handlers
 * 知识库相关的 IPC 处理函数
 */

import { ipcMain, IpcMainInvokeEvent, dialog } from 'electron'
import {
  KnowledgeService,
  type AddDocumentOptions,
  type SearchOptions
} from '../services/KnowledgeService'
import Logger from '../../shared/utils/logger'

/**
 * 注册知识库相关 IPC Handlers
 */
export function registerKnowledgeHandlers(knowledgeService: KnowledgeService) {
  // 添加文档（文本内容）
  ipcMain.handle(
    'knowledge:add-document',
    async (event: IpcMainInvokeEvent, notebookId: string, options: AddDocumentOptions) => {
      Logger.debug('KnowledgeHandlers', 'add-document:', { notebookId, title: options.title })

      try {
        const documentId = await knowledgeService.addDocument(
          notebookId,
          options,
          (stage, progress) => {
            // 发送进度更新
            event.sender.send('knowledge:index-progress', {
              notebookId,
              stage,
              progress
            })
          }
        )
        return { success: true, documentId }
      } catch (error) {
        Logger.error('KnowledgeHandlers', 'Error adding document:', error)
        return { success: false, error: (error as Error).message }
      }
    }
  )

  // 从文件添加文档
  ipcMain.handle(
    'knowledge:add-document-from-file',
    async (event: IpcMainInvokeEvent, notebookId: string, filePath: string) => {
      Logger.debug('KnowledgeHandlers', 'add-document-from-file:', { notebookId, filePath })

      try {
        const documentId = await knowledgeService.addDocumentFromFile(
          notebookId,
          filePath,
          (stage, progress) => {
            event.sender.send('knowledge:index-progress', {
              notebookId,
              stage,
              progress
            })
          }
        )
        return { success: true, documentId }
      } catch (error) {
        Logger.error('KnowledgeHandlers', 'Error adding document from file:', error)
        return { success: false, error: (error as Error).message }
      }
    }
  )

  // 从 URL 添加文档
  ipcMain.handle(
    'knowledge:add-document-from-url',
    async (event: IpcMainInvokeEvent, notebookId: string, url: string) => {
      Logger.debug('KnowledgeHandlers', 'add-document-from-url:', { notebookId, url })

      try {
        const documentId = await knowledgeService.addDocumentFromUrl(
          notebookId,
          url,
          (stage, progress) => {
            event.sender.send('knowledge:index-progress', {
              notebookId,
              stage,
              progress
            })
          }
        )
        return { success: true, documentId }
      } catch (error) {
        Logger.error('KnowledgeHandlers', 'Error adding document from URL:', error)
        return { success: false, error: (error as Error).message }
      }
    }
  )

  // 从 Note 添加到知识库
  ipcMain.handle(
    'knowledge:add-note',
    async (event: IpcMainInvokeEvent, notebookId: string, noteId: string) => {
      Logger.debug('KnowledgeHandlers', 'add-note:', { notebookId, noteId })

      try {
        const documentId = await knowledgeService.addNoteToKnowledge(
          notebookId,
          noteId,
          (stage, progress) => {
            event.sender.send('knowledge:index-progress', {
              notebookId,
              stage,
              progress
            })
          }
        )
        return { success: true, documentId }
      } catch (error) {
        Logger.error('KnowledgeHandlers', 'Error adding note:', error)
        return { success: false, error: (error as Error).message }
      }
    }
  )

  // 搜索知识库
  ipcMain.handle(
    'knowledge:search',
    async (_event, notebookId: string, query: string, options?: SearchOptions) => {
      Logger.debug('KnowledgeHandlers', 'search:', { notebookId, query })

      try {
        const results = await knowledgeService.search(notebookId, query, options)
        return { success: true, results }
      } catch (error) {
        Logger.error('KnowledgeHandlers', 'Error searching:', error)
        return { success: false, error: (error as Error).message, results: [] }
      }
    }
  )

  // 获取文档列表
  ipcMain.handle('knowledge:get-documents', async (_event, notebookId: string) => {
    Logger.debug('KnowledgeHandlers', 'get-documents:', notebookId)

    try {
      const docs = knowledgeService.getDocuments(notebookId)
      return docs
    } catch (error) {
      Logger.error('KnowledgeHandlers', 'Error getting documents:', error)
      return []
    }
  })

  // 获取单个文档
  ipcMain.handle('knowledge:get-document', async (_event, documentId: string) => {
    Logger.debug('KnowledgeHandlers', 'get-document:', documentId)

    try {
      const doc = knowledgeService.getDocument(documentId)
      return doc || null
    } catch (error) {
      Logger.error('KnowledgeHandlers', 'Error getting document:', error)
      return null
    }
  })

  // 获取文档的 chunks
  ipcMain.handle('knowledge:get-document-chunks', async (_event, documentId: string) => {
    Logger.debug('KnowledgeHandlers', 'get-document-chunks:', documentId)

    try {
      const chunks = knowledgeService.getDocumentChunks(documentId)
      return chunks
    } catch (error) {
      Logger.error('KnowledgeHandlers', 'Error getting document chunks:', error)
      return []
    }
  })

  // 删除文档
  ipcMain.handle('knowledge:delete-document', async (_event, documentId: string) => {
    Logger.debug('KnowledgeHandlers', 'delete-document:', documentId)

    try {
      await knowledgeService.deleteDocument(documentId)
      return { success: true }
    } catch (error) {
      Logger.error('KnowledgeHandlers', 'Error deleting document:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  // 重建索引
  ipcMain.handle(
    'knowledge:reindex-document',
    async (event: IpcMainInvokeEvent, documentId: string) => {
      Logger.debug('KnowledgeHandlers', 'reindex-document:', documentId)

      try {
        await knowledgeService.reindexDocument(documentId, (stage, progress) => {
          event.sender.send('knowledge:index-progress', {
            documentId,
            stage,
            progress
          })
        })
        return { success: true }
      } catch (error) {
        Logger.error('KnowledgeHandlers', 'Error reindexing document:', error)
        return { success: false, error: (error as Error).message }
      }
    }
  )

  // 获取知识库统计信息
  ipcMain.handle('knowledge:get-stats', async (_event, notebookId: string) => {
    Logger.debug('KnowledgeHandlers', 'get-stats:', notebookId)

    try {
      const stats = knowledgeService.getStats(notebookId)
      return stats
    } catch (error) {
      Logger.error('KnowledgeHandlers', 'Error getting stats:', error)
      return { documentCount: 0, chunkCount: 0, embeddingCount: 0 }
    }
  })

  // 打开文件选择对话框
  ipcMain.handle('knowledge:select-files', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Documents', extensions: ['pdf', 'docx', 'doc', 'txt', 'md'] },
        { name: 'PDF', extensions: ['pdf'] },
        { name: 'Word', extensions: ['docx', 'doc'] },
        { name: 'Text', extensions: ['txt', 'md'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })

    return result.canceled ? [] : result.filePaths
  })

  Logger.info('KnowledgeHandlers', 'Knowledge handlers registered')
}
