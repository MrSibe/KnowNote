import { OpenAICompatibleProvider } from './base/OpenAICompatibleProvider'
import { cleanDeepSeekMessages, validateMessageOrder } from '../utils/messageValidator'
import type { APIMessage, StreamChunk } from '../../shared/types/chat'

/**
 * DeepSeek Provider 实现
 * DeepSeek API 兼容 OpenAI API 格式
 * 继承自 OpenAICompatibleProvider，只需定义特定的配置参数
 */
export class DeepSeekProvider extends OpenAICompatibleProvider {
  readonly name = 'deepseek'

  protected getDefaultBaseUrl(): string {
    return 'https://api.deepseek.com/v1'
  }

  protected getDefaultModel(): string {
    return 'deepseek-chat'
  }

  /**
   * 重写消息发送方法，添加 DeepSeek 特定的消息清理和验证
   * 确保消息格式符合 DeepSeek API 要求
   */
  async sendMessageStream(
    messages: APIMessage[],
    onChunk: (chunk: StreamChunk) => void,
    onError: (error: Error) => void,
    onComplete: () => void
  ): Promise<void> {
    try {
      // 1. DeepSeek 特定的消息清理
      const cleanedMessages = cleanDeepSeekMessages(messages)

      // 2. 验证消息顺序
      const validation = validateMessageOrder(cleanedMessages)
      if (!validation.valid) {
        onError(new Error(`消息格式验证失败: ${validation.error}`))
        return
      }

      // 3. 调用父类方法
      await super.sendMessageStream(cleanedMessages, onChunk, onError, onComplete)
    } catch (error) {
      onError(error as Error)
    }
  }
}
