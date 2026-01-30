/**
 * Anki IPC Handlers
 * Anki卡片功能的 IPC 通信处理
 */

import { ipcMain, dialog, BrowserWindow } from 'electron'
import type { AnkiCardService } from '../services/AnkiCardService'
import type { AnkiExportFormat, AnkiGenerationOptions } from '../../shared/types/anki'
import { createAnkiWindow } from '../windows/ankiWindow'
import { ApkgExporter } from '../services/exporters/ApkgExporter'
import path from 'path'
import { app } from 'electron'
import fs from 'fs'

/**
 * 注册anki相关的IPC handlers
 */
export function registerAnkiHandlers(ankiCardService: AnkiCardService) {
  /**
   * 生成卡片
   */
  ipcMain.handle(
    'anki:generate',
    async (event, args: { notebookId: string; options?: AnkiGenerationOptions }) => {
      try {
        const ankiCardId = await ankiCardService.generateAnkiCards(
          args.notebookId,
          args.options,
          (stage, progress) => {
            // 发送进度更新事件
            if (!event.sender.isDestroyed()) {
              event.sender.send('anki:progress', {
                notebookId: args.notebookId,
                stage,
                progress
              })
            }
          }
        )
        return { success: true, ankiCardId }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    }
  )

  /**
   * 获取笔记本最新卡片集
   */
  ipcMain.handle('anki:get-latest', async (_, args: { notebookId: string }) => {
    try {
      const ankiCard = ankiCardService.getLatestAnkiCards(args.notebookId)
      return ankiCard || null
    } catch (error) {
      console.error('Error getting latest anki cards:', error)
      return null
    }
  })

  /**
   * 获取指定卡片集
   */
  ipcMain.handle('anki:get', async (_, args: { ankiCardId: string }) => {
    try {
      const ankiCard = ankiCardService.getAnkiCards(args.ankiCardId)
      return ankiCard || null
    } catch (error) {
      console.error('Error getting anki cards:', error)
      return null
    }
  })

  /**
   * 更新卡片集
   */
  ipcMain.handle(
    'anki:update',
    async (_, args: { ankiCardId: string; updates: { title?: string } }) => {
      try {
        ankiCardService.updateAnkiCards(args.ankiCardId, args.updates)
        return { success: true }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    }
  )

  /**
   * 删除卡片集
   */
  ipcMain.handle('anki:delete', async (_, args: { ankiCardId: string }) => {
    try {
      ankiCardService.deleteAnkiCards(args.ankiCardId)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  /**
   * 导出卡片
   */
  ipcMain.handle(
    'anki:export',
    async (event, args: { ankiCardId: string; format: AnkiExportFormat; deckName?: string }) => {
      try {
        // 获取卡片集
        const ankiCard = ankiCardService.getAnkiCards(args.ankiCardId)
        if (!ankiCard) {
          return { success: false, error: '卡片集不存在' }
        }

        // 获取窗口引用以显示保存对话框
        const mainWindow = BrowserWindow.fromWebContents(event.sender)
        if (!mainWindow) {
          return { success: false, error: '无法获取窗口引用' }
        }

        // 根据格式导出
        if (args.format === 'apkg') {
          // 使用ApkgExporter导出
          const exporter = new ApkgExporter()
          const { buffer, summary } = await exporter.export(
            ankiCard.cardsData as any,
            args.deckName || ankiCard.title
          )

          // 显示保存对话框
          const result = await dialog.showSaveDialog(mainWindow, {
            title: '导出Anki卡片',
            defaultPath: path.join(
              app.getPath('downloads'),
              `${ankiCard.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}_${ankiCard.version}.apkg`
            ),
            filters: [{ name: 'Anki Card Package', extensions: ['apkg'] }]
          })

          if (result.canceled || !result.filePath) {
            return { success: false, error: '用户取消保存' }
          }

          // 写入文件（异步，避免阻塞主进程）
          await fs.promises.writeFile(result.filePath, buffer)
          return { success: true, filePath: result.filePath, summary }
        }

        return { success: false, error: '不支持的导出格式' }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    }
  )

  /**
   * 导出卡片到指定路径
   */
  ipcMain.handle('anki:exportToPath', async (_, args: { ankiCardId: string; filePath: string }) => {
    try {
      // 获取卡片集
      const ankiCard = ankiCardService.getAnkiCards(args.ankiCardId)
      if (!ankiCard) {
        return { success: false, error: '卡片集不存在' }
      }

      // 使用ApkgExporter导出
      const exporter = new ApkgExporter()
      const { buffer, summary } = await exporter.export(ankiCard.cardsData as any, ankiCard.title)

      // 写入文件（异步）
      await fs.promises.writeFile(args.filePath, buffer)
      return { success: true, filePath: args.filePath, summary }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  /**
   * 打开Anki窗口
   */
  ipcMain.handle(
    'anki:open-window',
    async (_, args: { notebookId: string; ankiCardId?: string }) => {
      try {
        createAnkiWindow(args.notebookId, args.ankiCardId)
        return { success: true }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    }
  )
}
