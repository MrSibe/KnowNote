/**
 * Quiz IPC Handlers
 * 答题功能的 IPC 通信处理
 */

import { ipcMain } from 'electron'
import type { QuizService, QuizGenerationOptions } from '../services/QuizService'
import { createQuizWindow } from '../windows/quizWindow'

/**
 * 注册quiz相关的IPC handlers
 */
export function registerQuizHandlers(quizService: QuizService) {
  /**
   * 生成题目
   */
  ipcMain.handle(
    'quiz:generate',
    async (event, args: { notebookId: string; options?: QuizGenerationOptions }) => {
      try {
        const quizId = await quizService.generateQuiz(
          args.notebookId,
          args.options,
          (stage, progress) => {
            // 发送进度更新事件
            if (!event.sender.isDestroyed()) {
              event.sender.send('quiz:progress', {
                notebookId: args.notebookId,
                stage,
                progress
              })
            }
          }
        )
        return { success: true, quizId }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    }
  )

  /**
   * 获取笔记本最新题库
   */
  ipcMain.handle('quiz:get-latest', async (_, args: { notebookId: string }) => {
    try {
      const quiz = quizService.getLatestQuiz(args.notebookId)
      return quiz || null
    } catch (error) {
      console.error('Error getting latest quiz:', error)
      return null
    }
  })

  /**
   * 获取指定题库
   */
  ipcMain.handle('quiz:get', async (_, args: { quizId: string }) => {
    try {
      const quiz = quizService.getQuiz(args.quizId)
      return quiz || null
    } catch (error) {
      console.error('Error getting quiz:', error)
      return null
    }
  })

  /**
   * 提交答题会话
   */
  ipcMain.handle(
    'quiz:submit-session',
    async (_, args: { quizId: string; answers: Record<string, number> }) => {
      try {
        const sessionId = quizService.submitSession(args.quizId, args.answers)
        return { success: true, sessionId }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    }
  )

  /**
   * 获取答题会话
   */
  ipcMain.handle('quiz:get-session', async (_, args: { sessionId: string }) => {
    try {
      const session = quizService.getSession(args.sessionId)
      return session || null
    } catch (error) {
      console.error('Error getting quiz session:', error)
      return null
    }
  })

  /**
   * 更新题库
   */
  ipcMain.handle('quiz:update', async (_, args: { quizId: string; updates: { title?: string } }) => {
    try {
      quizService.updateQuiz(args.quizId, args.updates)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  /**
   * 删除题库
   */
  ipcMain.handle('quiz:delete', async (_, args: { quizId: string }) => {
    try {
      quizService.deleteQuiz(args.quizId)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  /**
   * 打开答题窗口
   */
  ipcMain.handle(
    'quiz:open-window',
    async (_, args: { notebookId: string; quizId?: string }) => {
      try {
        createQuizWindow(args.notebookId, args.quizId)
        return { success: true }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    }
  )
}
