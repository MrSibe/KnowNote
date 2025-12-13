import type { LLMProvider } from './types'
import { OpenAIProvider } from './OpenAIProvider'
import { OllamaProvider } from './OllamaProvider'
import { DeepSeekProvider } from './DeepSeekProvider'
import { SiliconFlowProvider } from './SiliconFlowProvider'
import { settingsManager, providersManager } from '../config'
import Logger from '../../shared/utils/logger'

/**
 * Provider Manager
 * Manages all AI Provider instances and provides unified access interface
 * Uses Electron Store as configuration storage, changes take effect immediately without restart
 */
export class ProviderManager {
  private providers: Map<string, LLMProvider> = new Map()

  constructor() {
    // Register all providers
    this.registerProvider(new OpenAIProvider())
    this.registerProvider(new OllamaProvider())
    this.registerProvider(new DeepSeekProvider())
    this.registerProvider(new SiliconFlowProvider())

    Logger.info('ProviderManager', `Registered ${this.providers.size} providers`)
  }

  /**
   * Register a provider
   */
  private registerProvider(provider: LLMProvider) {
    this.providers.set(provider.name, provider)
    Logger.debug('ProviderManager', `Registered provider: ${provider.name}`)
  }

  /**
   * Get provider by name
   */
  getProvider(name: string): LLMProvider | undefined {
    return this.providers.get(name)
  }

  /**
   * Get currently active provider
   * Priority: Use default chat model selected by user in settings
   * If no default model, return first enabled provider
   */
  async getActiveProvider(): Promise<LLMProvider | null> {
    try {
      const settings = await settingsManager.getAllSettings()
      const defaultChatModel = settings.defaultChatModel

      // If user has set default chat model, parse and use it
      if (defaultChatModel && defaultChatModel.includes(':')) {
        const [providerName, modelId] = defaultChatModel.split(':')
        const config = await providersManager.getProviderConfig(providerName)

        if (config && config.enabled) {
          const provider = this.providers.get(providerName)
          if (provider) {
            // Configure provider with specified model
            provider.configure({
              ...config.config,
              model: modelId
            })
            Logger.info('ProviderManager', `Using default chat model: ${providerName} - ${modelId}`)
            return provider
          }
        } else {
          Logger.warn(
            'ProviderManager',
            `Provider for default chat model "${providerName}" is not enabled or does not exist`
          )
        }
      }

      // If no default model or default model unavailable, use first enabled provider
      const allConfigs = await providersManager.getAllProviderConfigs()
      const enabledConfig = allConfigs.find((c) => c.enabled)

      if (!enabledConfig) {
        Logger.warn('ProviderManager', 'No enabled provider found')
        return null
      }

      const provider = this.providers.get(enabledConfig.providerName)
      if (!provider) {
        Logger.error('ProviderManager', `Provider "${enabledConfig.providerName}" not registered`)
        return null
      }

      // Configure provider
      provider.configure(enabledConfig.config)

      Logger.info('ProviderManager', `Using provider: ${provider.name}`)
      return provider
    } catch (error) {
      Logger.error('ProviderManager', 'Failed to get active provider:', error)
      return null
    }
  }

  /**
   * Get embedding provider
   * Priority: Use default embedding model selected by user in settings
   * If no default embedding model, use the chat model provider
   * If no chat model, return first enabled provider
   */
  async getEmbeddingProvider(): Promise<LLMProvider | null> {
    try {
      const settings = await settingsManager.getAllSettings()
      const defaultEmbeddingModel = settings.defaultEmbeddingModel

      // If user has set default embedding model, parse and use it
      if (defaultEmbeddingModel && defaultEmbeddingModel.includes(':')) {
        const [providerName, modelId] = defaultEmbeddingModel.split(':')
        const config = await providersManager.getProviderConfig(providerName)

        if (config && config.enabled) {
          const provider = this.providers.get(providerName)
          if (provider) {
            // Configure provider with specified model
            provider.configure({
              ...config.config,
              model: modelId
            })
            Logger.info(
              'ProviderManager',
              `Using default embedding model: ${providerName} - ${modelId}`
            )
            return provider
          }
        } else {
          Logger.warn(
            'ProviderManager',
            `Provider for default embedding model "${providerName}" is not enabled or does not exist`
          )
        }
      }

      // Fallback: use chat provider
      Logger.info(
        'ProviderManager',
        'No embedding model specified, using chat provider for embeddings'
      )
      return this.getActiveProvider()
    } catch (error) {
      Logger.error('ProviderManager', 'Failed to get embedding provider:', error)
      return null
    }
  }

  /**
   * List all registered provider names
   */
  listProviders(): string[] {
    return Array.from(this.providers.keys())
  }
}
