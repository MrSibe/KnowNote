import { ipcMain, IpcMainInvokeEvent } from 'electron'
import * as queries from '../db/queries'
import { ProviderManager } from '../providers/ProviderManager'
import { SessionAutoSwitchService } from '../services/SessionAutoSwitchService'

/**
 * 注册聊天相关的 IPC Handlers
 */
export function registerChatHandlers(
  providerManager: ProviderManager,
  sessionAutoSwitchService: SessionAutoSwitchService
) {
  // ==================== Chat Session ====================
  ipcMain.handle('create-chat-session', async (_event, notebookId: string, title: string) => {
    return queries.createSession(notebookId, title)
  })

  ipcMain.handle('get-chat-sessions', async (_event, notebookId: string) => {
    return queries.getSessionsByNotebook(notebookId)
  })

  ipcMain.handle('get-active-session', async (_event, notebookId: string) => {
    return queries.getActiveSessionByNotebook(notebookId)
  })

  ipcMain.handle('update-session-title', async (_event, sessionId: string, title: string) => {
    queries.updateSessionTitle(sessionId, title)
  })

  ipcMain.handle('delete-session', async (_event, sessionId: string) => {
    queries.deleteSession(sessionId)
  })

  // ==================== Chat Message ====================
  ipcMain.handle('get-messages', async (_event, sessionId: string) => {
    return queries.getMessagesBySession(sessionId)
  })

  ipcMain.handle(
    'send-message',
    async (event: IpcMainInvokeEvent, sessionId: string, content: string) => {
      // 1. 保存用户消息
      queries.createMessage(sessionId, 'user', content)

      // 2. 创建 assistant 消息占位符
      const assistantMessage = queries.createMessage(sessionId, 'assistant', '')

      // 3. 获取历史消息作为上下文
      const history = queries.getMessagesBySession(sessionId)
      const messages = history.map((m: any) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      }))

      // 4. 调用 AI Provider 流式生成
      const provider = await providerManager.getActiveProvider()
      if (!provider) {
        event.sender.send('message-error', {
          messageId: assistantMessage.id,
          error: '未配置 AI Provider，请在设置中配置'
        })
        return assistantMessage.id
      }

      let fullContent = ''
      let usageMetadata: any = null

      provider.sendMessageStream(
        messages,
        // onChunk
        (chunk) => {
          fullContent += chunk.content

          // 保存 metadata（包含 token 使用信息）
          if (chunk.metadata) {
            usageMetadata = chunk.metadata
          }

          event.sender.send('message-chunk', {
            messageId: assistantMessage.id,
            chunk: chunk.content,
            done: chunk.done
          })
        },
        // onError
        (error) => {
          event.sender.send('message-error', {
            messageId: assistantMessage.id,
            error: error.message
          })
        },
        // onComplete
        async () => {
          // 更新数据库中的完整内容
          queries.updateMessageContent(assistantMessage.id, fullContent)

          // 计算 token 使用量
          let tokensUsed = 0
          if (usageMetadata?.usage?.total_tokens) {
            // 如果 API 返回了精确的 token 数
            tokensUsed = usageMetadata.usage.total_tokens
          } else {
            // 降级：使用估算
            const userTokens = SessionAutoSwitchService.estimateTokens(content)
            const assistantTokens = SessionAutoSwitchService.estimateTokens(fullContent)
            tokensUsed = userTokens + assistantTokens
          }

          console.log(`[send-message] 本次对话使用 tokens: ${tokensUsed}`)

          // 检查是否需要自动切换 session
          const newSessionId = await sessionAutoSwitchService.recordTokenUsageAndCheckSwitch(
            sessionId,
            tokensUsed
          )

          if (newSessionId) {
            // 通知前端切换到新 session
            event.sender.send('session-auto-switched', {
              oldSessionId: sessionId,
              newSessionId: newSessionId
            })
          }
        }
      )

      return assistantMessage.id
    }
  )
}
