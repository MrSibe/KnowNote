import { OpenAICompatibleProvider } from './base/OpenAICompatibleProvider'
import type { LLMProviderConfig } from './types'
import Logger from '../../shared/utils/logger'

/**
 * SiliconFlow Provider 实现
 * SiliconFlow API 兼容 OpenAI API 格式
 * 继承自 OpenAICompatibleProvider，只需定义特定的配置参数
 */
export class SiliconFlowProvider extends OpenAICompatibleProvider {
  readonly name = 'siliconflow'

  protected getDefaultBaseUrl(): string {
    return 'https://api.siliconflow.cn/v1'
  }

  protected getDefaultModel(): string {
    return 'deepseek-ai/deepseek-chat'
  }

  /**
   * SiliconFlow 特定的模型验证
   * 可以根据需要重写以实现自定义逻辑
   */
  async validateConfig(config: LLMProviderConfig): Promise<boolean> {
    try {
      // 使用父类的基本验证逻辑
      const isValid = await super.validateConfig(config)

      if (isValid) {
        Logger.info('SiliconFlowProvider', 'Configuration validation successful')
      } else {
        Logger.warn('SiliconFlowProvider', 'Configuration validation failed')
      }

      return isValid
    } catch (error) {
      Logger.error('SiliconFlowProvider', 'Validation error:', error)
      return false
    }
  }
}
