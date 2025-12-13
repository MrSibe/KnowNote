import { ipcMain, IpcMainInvokeEvent } from 'electron'
import * as queries from '../db/queries'
import { ProviderManager } from '../providers/ProviderManager'
import { SessionAutoSwitchService } from '../services/SessionAutoSwitchService'
import { KnowledgeService } from '../services/KnowledgeService'
import { validateAndCleanMessages } from '../utils/messageValidator'
import Logger from '../../shared/utils/logger'

/**
 * 构建 RAG 上下文 prompt
 */
function buildRAGContext(
  searchResults: Array<{
    documentTitle: string
    content: string
    score: number
  }>
): string {
  if (searchResults.length === 0) return ''

  const contextParts = searchResults.map((result, index) => {
    return `[来源 ${index + 1}: ${result.documentTitle}]\n${result.content}`
  })

  return `以下是与用户问题相关的背景知识，请参考这些信息来回答：

${contextParts.join('\n\n---\n\n')}

请基于以上背景知识回答用户的问题。如果背景知识不足以回答问题，请说明并尽力提供有帮助的回答。`
}

/**
 * Register chat-related IPC Handlers
 */
export function registerChatHandlers(
  providerManager: ProviderManager,
  sessionAutoSwitchService: SessionAutoSwitchService,
  knowledgeService: KnowledgeService
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
          error: 'No valid conversation history'
        })
        return assistantMessage.id
      }

      // 3.2 RAG 增强：检索相关知识并注入上下文
      try {
        const session = queries.getSessionById(sessionId)
        if (session?.notebookId) {
          const searchResults = await knowledgeService.search(session.notebookId, content, {
            topK: 3,
            threshold: 0.5
          })

          if (searchResults.length > 0) {
            const ragContext = buildRAGContext(searchResults)
            Logger.debug(
              'ChatHandlers',
              `RAG: Found ${searchResults.length} relevant chunks for query`
            )

            // 将 RAG 上下文作为 system message 插入到消息列表开头
            messages.unshift({
              role: 'system',
              content: ragContext
            })
          }
        }
      } catch (error) {
        // RAG 失败不应该阻止对话，只记录警告
        Logger.warn('ChatHandlers', 'RAG search failed:', error)
      }

      // 4. 调用 AI Provider 流式生成
      const provider = await providerManager.getActiveProvider()
      if (!provider) {
        event.sender.send('message-error', {
          messageId: assistantMessage.id,
          error: 'AI Provider not configured, please configure in settings'
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

            Logger.debug('ChatHandlers', `Tokens used in this conversation: ${tokensUsed}`)

            // Check if session auto-switch is needed
            const newSessionId = await sessionAutoSwitchService.recordTokenUsageAndCheckSwitch(
              sessionId,
              tokensUsed
            )

            if (newSessionId) {
              // Notify frontend to switch to new session
              event.sender.send('session-auto-switched', {
                oldSessionId: sessionId,
                newSessionId: newSessionId
              })
            }

            // Send completion event to notify frontend streaming is complete
            event.sender.send('message-complete', {
              messageId: assistantMessage.id
            })
          } catch (error) {
            Logger.error('ChatHandlers', 'Error in completion callback:', error)
            event.sender.send('message-error', {
              messageId: assistantMessage.id,
              error: 'Error occurred while processing message'
            })
          }
        }
      )

      // Return messageId immediately so frontend can continue
      return assistantMessage.id
    }
  )
}
