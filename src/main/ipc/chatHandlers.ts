import { ipcMain, IpcMainInvokeEvent } from 'electron'
import * as queries from '../db/queries'
import { ProviderManager } from '../providers/ProviderManager'
import { SessionAutoSwitchService } from '../services/SessionAutoSwitchService'
import { validateAndCleanMessages } from '../utils/messageValidator'

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
    return { success: true }
  })

  ipcMain.handle('delete-session', async (_event, sessionId: string) => {
    queries.deleteSession(sessionId)
    return { success: true }
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
      let messages = history.map((m: any) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      }))

      // 3.1 通用消息清理（过滤空消息和无效格式）
      messages = validateAndCleanMessages(messages)

      // 验证清理后是否还有有效消息
      if (messages.length === 0) {
        event.sender.send('message-error', {
          messageId: assistantMessage.id,
          error: '没有有效的对话历史'
        })
        return assistantMessage.id
      }

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
      let fullReasoningContent = ''
      let usageMetadata: any = null

      provider.sendMessageStream(
        messages,
        // onChunk
        (chunk) => {
          fullContent += chunk.content

          // 累积推理内容
          if (chunk.reasoningContent) {
            fullReasoningContent += chunk.reasoningContent
          }

          // 保存 metadata（包含 token 使用信息）
          if (chunk.metadata) {
            usageMetadata = chunk.metadata
          }

          event.sender.send('message-chunk', {
            messageId: assistantMessage.id,
            chunk: chunk.content,
            reasoningChunk: chunk.reasoningContent,
            done: chunk.done,
            reasoningDone: chunk.reasoningDone
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
          try {
            // 更新数据库中的完整内容（包含推理内容）
            queries.updateMessageContent(assistantMessage.id, fullContent, fullReasoningContent)

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

            // 发送完成事件，通知前端流式传输已完成
            event.sender.send('message-complete', {
              messageId: assistantMessage.id
            })
          } catch (error) {
            console.error('[send-message] 完成回调中发生错误:', error)
            event.sender.send('message-error', {
              messageId: assistantMessage.id,
              error: '处理消息时发生错误'
            })
          }
        }
      )

      // 立即返回 messageId，让前端可以继续操作
      return assistantMessage.id
    }
  )
}
