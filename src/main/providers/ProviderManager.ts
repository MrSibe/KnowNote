import type { LLMProvider } from './types'
import { OpenAIProvider } from './OpenAIProvider'
import { OllamaProvider } from './OllamaProvider'
import { DeepSeekProvider } from './DeepSeekProvider'
import { settingsManager, providersManager } from '../config/store'

/**
 * Provider Manager
 * 管理所有 AI Provider 实例并提供统一的访问接口
 * 使用 Electron Store 作为配置存储，修改后立即生效无需重启
 */
export class ProviderManager {
  private providers: Map<string, LLMProvider> = new Map()

  constructor() {
    // 注册所有 Provider
    this.registerProvider(new OpenAIProvider())
    this.registerProvider(new OllamaProvider())
    this.registerProvider(new DeepSeekProvider())

    console.log(`[ProviderManager] 已注册 ${this.providers.size} 个 Provider`)
  }

  /**
   * 注册一个 Provider
   */
  private registerProvider(provider: LLMProvider) {
    this.providers.set(provider.name, provider)
    console.log(`[ProviderManager] 已注册 Provider: ${provider.name}`)
  }

  /**
   * 获取指定名称的 Provider
   */
  getProvider(name: string): LLMProvider | undefined {
    return this.providers.get(name)
  }

  /**
   * 获取当前激活的 Provider
   * 优先使用用户在设置中选择的默认模型
   * 如果没有默认模型，返回第一个启用的 Provider
   */
  async getActiveProvider(): Promise<LLMProvider | null> {
    try {
      const settings = await settingsManager.getAllSettings()
      const defaultModel = settings.defaultModel

      // 如果用户设置了默认模型，解析并使用它
      if (defaultModel && defaultModel.includes(':')) {
        const [providerName, modelId] = defaultModel.split(':')
        const config = await providersManager.getProviderConfig(providerName)

        if (config && config.enabled) {
          const provider = this.providers.get(providerName)
          if (provider) {
            // 配置 Provider，并指定模型
            provider.configure({
              ...config.config,
              model: modelId
            })
            console.log(`[ProviderManager] 使用默认模型: ${providerName} - ${modelId}`)
            return provider
          }
        } else {
          console.warn(
            `[ProviderManager] 默认模型对应的 Provider "${providerName}" 未启用或不存在`
          )
        }
      }

      // 如果没有默认模型或默认模型不可用，使用第一个启用的 Provider
      const allConfigs = await providersManager.getAllProviderConfigs()
      const enabledConfig = allConfigs.find((c) => c.enabled)

      if (!enabledConfig) {
        console.warn('[ProviderManager] 未找到启用的 Provider')
        return null
      }

      const provider = this.providers.get(enabledConfig.providerName)
      if (!provider) {
        console.error(`[ProviderManager] Provider "${enabledConfig.providerName}" 未注册`)
        return null
      }

      // 配置 Provider
      provider.configure(enabledConfig.config)

      console.log(`[ProviderManager] 使用 Provider: ${provider.name}`)
      return provider
    } catch (error) {
      console.error('[ProviderManager] 获取激活 Provider 失败:', error)
      return null
    }
  }

  /**
   * 列出所有已注册的 Provider 名称
   */
  listProviders(): string[] {
    return Array.from(this.providers.keys())
  }
}
