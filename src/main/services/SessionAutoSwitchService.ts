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
   * 估算消息的 token 数量
   * 使用改进的算法区分中英文字符，提高估算精度
   *
   * 参考：
   * - 英文/数字/符号: ~4 字符 = 1 token
   * - 中文/日文/韩文: ~1.5 字符 = 1 token
   * - 代码块: ~3.5 字符 = 1 token
   */
  static estimateTokens(text: string): number {
    if (!text || text.length === 0) return 0

    let chineseChars = 0
    let englishChars = 0
    let codeChars = 0

    // 检测是否在代码块中
    const codeBlockRegex = /```[\s\S]*?```|`[^`]+`/g
    const codeBlocks = text.match(codeBlockRegex) || []

    // 统计代码块字符
    codeBlocks.forEach((block) => {
      codeChars += block.length
    })

    // 移除代码块后统计其他字符
    const textWithoutCode = text.replace(codeBlockRegex, '')

    for (const char of textWithoutCode) {
      const code = char.charCodeAt(0)

      // 中文字符范围（CJK统一汉字）
      if (
        (code >= 0x4e00 && code <= 0x9fff) || // CJK基本区
        (code >= 0x3400 && code <= 0x4dbf) || // CJK扩展A
        (code >= 0xf900 && code <= 0xfaff) || // CJK兼容汉字
        (code >= 0x3040 && code <= 0x309f) || // 日文平假名
        (code >= 0x30a0 && code <= 0x30ff) || // 日文片假名
        (code >= 0xac00 && code <= 0xd7af) // 韩文
      ) {
        chineseChars++
      } else {
        englishChars++
      }
    }

    // 分别计算各部分的token数
    const chineseTokens = chineseChars / 1.5 // 中文：1.5字符≈1token
    const englishTokens = englishChars / 4 // 英文：4字符≈1token
    const codeTokens = codeChars / 3.5 // 代码：3.5字符≈1token

    return Math.ceil(chineseTokens + englishTokens + codeTokens)
  }
}
