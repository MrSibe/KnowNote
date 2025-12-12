import * as queries from '../db/queries'
import { ProviderManager } from '../providers/ProviderManager'

/**
 * Session 自动切换服务
 * 负责管理 session 的 token 计数和自动切换逻辑
 */
export class SessionAutoSwitchService {
  // Token 阈值：80% 的 GPT-4 上下文窗口（128k tokens）
  private static readonly TOKEN_THRESHOLD = 100000

  private providerManager: ProviderManager

  constructor(providerManager: ProviderManager) {
    this.providerManager = providerManager
  }

  /**
   * 记录 token 使用量并检查是否需要切换 session
   * @returns 如果切换了 session，返回新 session 的 ID；否则返回 null
   */
  async recordTokenUsageAndCheckSwitch(
    sessionId: string,
    tokensUsed: number
  ): Promise<string | null> {
    // 更新 token 计数
    const newTotal = queries.updateSessionTokens(sessionId, tokensUsed)

    console.log(`[SessionAutoSwitch] Session ${sessionId} 当前 tokens: ${newTotal}`)

    // 检查是否需要切换
    if (newTotal && newTotal >= SessionAutoSwitchService.TOKEN_THRESHOLD) {
      console.log(
        `[SessionAutoSwitch] Token 数达到阈值 (${newTotal}/${SessionAutoSwitchService.TOKEN_THRESHOLD})，开始切换 session...`
      )
      return await this.switchSession(sessionId)
    }

    return null
  }

  /**
   * 切换 session：生成摘要，归档旧 session，创建新 session
   */
  private async switchSession(oldSessionId: string): Promise<string> {
    // 1. 获取旧 session 信息
    const oldSession = queries.getSessionById(oldSessionId)
    if (!oldSession) {
      throw new Error(`Session ${oldSessionId} 不存在`)
    }

    // 2. 生成摘要
    console.log('[SessionAutoSwitch] 正在生成会话摘要...')
    const summary = await this.generateSummary(oldSessionId)

    // 3. 归档旧 session
    queries.updateSessionSummary(oldSessionId, summary, 'archived')
    console.log('[SessionAutoSwitch] 已归档旧 session')

    // 4. 创建新 session，设置父session ID
    const newSession = queries.createSession(
      oldSession.notebookId,
      oldSession.title, // 保持相同的标题
      oldSessionId // 设置父session ID，形成链
    )

    // 5. 在新 session 中添加一条轻量系统消息（可选）
    // 用户无需感知session切换，所以简化提示
    queries.createMessage(newSession.id, 'system', `💡 上下文已优化，对话继续...`)

    console.log(`[SessionAutoSwitch] 已创建新 session: ${newSession.id}`)

    return newSession.id
  }

  /**
   * 生成会话摘要
   */
  private async generateSummary(sessionId: string): Promise<string> {
    const messages = queries.getMessagesBySession(sessionId)

    // 构建摘要提示词
    const conversationText = messages
      .filter((m) => m.role !== 'system') // 过滤系统消息
      .map((m) => `${m.role === 'user' ? '用户' : 'AI'}: ${m.content}`)
      .join('\n\n')

    const summaryPrompt = `请简洁地总结以下对话的核心内容，保留关键信息、重要决策和技术细节。总结应该在 300 字以内。

对话内容：
${conversationText}

请提供总结：`

    // 调用 AI 生成摘要
    const provider = await this.providerManager.getActiveProvider()
    if (!provider) {
      // 如果没有配置 provider，返回一个基础的摘要
      return `本次对话包含 ${messages.length} 条消息。`
    }

    return new Promise<string>((resolve) => {
      let summaryContent = ''

      provider.sendMessageStream(
        [
          {
            role: 'user',
            content: summaryPrompt
          }
        ],
        // onChunk
        (chunk) => {
          summaryContent += chunk.content
        },
        // onError
        (error) => {
          console.error('[SessionAutoSwitch] 生成摘要失败:', error)
          // 降级：返回简单摘要
          resolve(`本次对话包含 ${messages.length} 条消息。`)
        },
        // onComplete
        () => {
          resolve(summaryContent.trim())
        }
      )
    })
  }

  /**
   * 估算消息的 token 数量（简单估算，约 1 token ≈ 4 字符）
   */
  static estimateTokens(text: string): number {
    // 简单估算：中文约 1.5 字符/token，英文约 4 字符/token
    // 这里用一个折中的值
    const avgCharsPerToken = 2.5
    return Math.ceil(text.length / avgCharsPerToken)
  }
}
