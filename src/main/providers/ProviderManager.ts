/**
 * Provider Manager
 * 协调 ProviderRegistry 和 ProviderConfigManager,提供统一的供应商访问接口
 */

import type { BaseProvider } from './capabilities/BaseProvider'
import type { ChatProvider } from './types'
import type { EmbeddingProvider } from './types'
import type { CustomProviderConfig, ProviderDescriptor } from './registry/ProviderDescriptor'
import { ProviderRegistry } from './registry/ProviderRegistry'
import { BUILTIN_PROVIDERS } from './registry/builtinProviders'
import { OpenAICompatibleProvider } from './base/OpenAICompatibleProvider'
import { settingsManager, providerConfigManager } from '../config'
import Logger from '../../shared/utils/logger'

/**
 * ProviderManager
 * 供应商管理器,协调注册表和配置管理
 */
export class ProviderManager {
  private registry: ProviderRegistry

  constructor() {
    this.registry = new ProviderRegistry()

    // 注册所有内置供应商
    this.registerBuiltinProviders()

    Logger.info('ProviderManager', 'Provider manager initialized')
  }

  /**
   * 注册所有内置供应商
   */
  private registerBuiltinProviders(): void {
    this.registry.registerMany(BUILTIN_PROVIDERS)
    Logger.info(
      'ProviderManager',
      `Registered ${BUILTIN_PROVIDERS.length} builtin providers: ${BUILTIN_PROVIDERS.map((p) => p.name).join(', ')}`
    )
  }

  /**
   * 获取已配置的 provider(合并配置)
   * @param name - 供应商名称
   * @returns BaseProvider 或 null
   */
  async getConfiguredProvider(name: string): Promise<BaseProvider | null> {
    const provider = this.registry.getProvider(name)
    if (!provider) {
      Logger.warn('ProviderManager', `Provider ${name} not found in registry`)
      return null
    }

    // 获取用户配置
    const config = await providerConfigManager.getProviderConfig(name)
    if (!config || !config.enabled) {
      Logger.warn('ProviderManager', `Provider ${name} is not enabled`)
      return null
    }

    // 配置 provider
    provider.configure(config.config)
    return provider
  }

  /**
   * 获取活跃的对话 provider
   * 如果用户设置了默认对话模型但不可用，会直接返回 null，不会自动 fallback
   */
  async getActiveChatProvider(): Promise<ChatProvider | null> {
    try {
      const settings = await settingsManager.getAllSettings()
      const defaultChatModel = settings.defaultChatModel

      // 如果用户设置了默认对话模型,解析并使用
      if (defaultChatModel && defaultChatModel.includes(':')) {
        const [providerName, ...modelIdParts] = defaultChatModel.split(':')
        const modelId = modelIdParts.join(':')
        const provider = await this.getConfiguredProvider(providerName)

        if (!provider) {
          Logger.error(
            'ProviderManager',
            `Provider for default chat model "${providerName}" is not available or not enabled`
          )
          return null
        }

        // 检查是否支持对话能力
        const compatProvider = provider as OpenAICompatibleProvider
        if (!compatProvider.hasChatCapability()) {
          Logger.error(
            'ProviderManager',
            `Provider ${providerName} does not support chat capability`
          )
          return null
        }

        // 使用指定的模型配置
        compatProvider.configure({ model: modelId })
        Logger.info('ProviderManager', `Using default chat model: ${providerName} - ${modelId}`)
        return compatProvider as ChatProvider
      }

      // 如果没有设置默认对话模型，返回 null
      Logger.warn('ProviderManager', 'No default chat model configured')
      return null
    } catch (error) {
      Logger.error('ProviderManager', 'Failed to get active chat provider:', error)
      return null
    }
  }

  /**
   * 获取活跃的嵌入 provider
   * 如果用户设置了默认嵌入模型但不可用，会直接返回 null，不会自动 fallback
   */
  async getActiveEmbeddingProvider(): Promise<EmbeddingProvider | null> {
    try {
      const settings = await settingsManager.getAllSettings()
      const defaultEmbeddingModel = settings.defaultEmbeddingModel

      // 如果用户设置了默认嵌入模型,解析并使用
      if (defaultEmbeddingModel && defaultEmbeddingModel.includes(':')) {
        const [providerName, ...modelIdParts] = defaultEmbeddingModel.split(':')
        const modelId = modelIdParts.join(':')
        const provider = await this.getConfiguredProvider(providerName)

        if (!provider) {
          Logger.error(
            'ProviderManager',
            `Provider for default embedding model "${providerName}" is not available or not enabled`
          )
          return null
        }

        // 检查是否支持嵌入能力
        const compatProvider = provider as OpenAICompatibleProvider
        if (!compatProvider.hasEmbeddingCapability()) {
          Logger.error(
            'ProviderManager',
            `Provider ${providerName} does not support embedding capability`
          )
          return null
        }

        // 使用指定的模型配置
        compatProvider.configure({ model: modelId })
        Logger.info(
          'ProviderManager',
          `Using default embedding model: ${providerName} - ${modelId}`
        )
        return compatProvider as EmbeddingProvider
      }

      // 如果没有设置默认嵌入模型，返回 null
      Logger.warn('ProviderManager', 'No default embedding model configured')
      return null
    } catch (error) {
      Logger.error('ProviderManager', 'Failed to get active embedding provider:', error)
      return null
    }
  }

  /**
   * 注册自定义供应商
   * @param config - 自定义供应商配置
   */
  async registerCustomProvider(config: CustomProviderConfig): Promise<void> {
    const descriptor: ProviderDescriptor = {
      name: config.providerName,
      displayName: config.displayName,
      isBuiltin: false,
      defaultBaseUrl: config.baseUrl,
      capabilities: {
        chat: true, // 自定义供应商默认假设支持对话
        embedding: true // 可以通过 fetchModels 后根据模型类型更新
      },
      createProvider: (descriptor) => new OpenAICompatibleProvider(descriptor)
    }

    // 注册到 registry
    this.registry.register(descriptor)

    // 保存配置
    await providerConfigManager.saveProviderConfig(
      config.providerName,
      {
        baseUrl: config.baseUrl,
        apiKey: config.apiKey
      },
      true // 默认启用
    )

    Logger.info('ProviderManager', `Registered custom provider: ${config.providerName}`)
  }

  /**
   * 列出所有已注册的供应商名称
   */
  listProviders(): string[] {
    return this.registry.listProviderNames()
  }

  /**
   * 获取供应商描述符
   */
  getDescriptor(name: string): ProviderDescriptor | undefined {
    return this.registry.getDescriptor(name)
  }

  /**
   * 列出所有供应商描述符
   */
  listDescriptors(): ProviderDescriptor[] {
    return this.registry.listDescriptors()
  }

  /**
   * 根据能力获取供应商
   */
  getProvidersByCapability(
    capability: 'chat' | 'embedding' | 'rerank' | 'imageGeneration'
  ): ProviderDescriptor[] {
    return this.registry.getProvidersByCapability(capability)
  }

  /**
   * 获取 provider(不带配置,用于向后兼容)
   * @deprecated 使用 getConfiguredProvider 替代
   */
  getProvider(name: string): BaseProvider | undefined {
    return this.registry.getProvider(name)
  }

  /**
   * 获取活跃 provider(向后兼容)
   * @deprecated 使用 getActiveChatProvider 替代
   */
  async getActiveProvider(): Promise<BaseProvider | null> {
    return this.getActiveChatProvider()
  }

  /**
   * 获取 embedding provider(向后兼容)
   * @deprecated 使用 getActiveEmbeddingProvider 替代
   */
  async getEmbeddingProvider(): Promise<BaseProvider | null> {
    return this.getActiveEmbeddingProvider()
  }
}
