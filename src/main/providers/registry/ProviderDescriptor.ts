/**
 * Provider Descriptor
 * 供应商描述符,用于配置驱动的供应商注册
 */

import type { BaseProvider } from '../capabilities/BaseProvider'

/**
 * Provider 能力配置
 */
export interface ProviderCapabilities {
  chat: boolean // 是否支持对话
  embedding: boolean // 是否支持嵌入
  rerank?: boolean // 是否支持重排序(未来扩展)
  imageGeneration?: boolean // 是否支持图像生成(未来扩展)
}

/**
 * Provider 描述符
 * 用于配置驱动的供应商定义
 */
export interface ProviderDescriptor {
  // 基本信息
  name: string // 供应商标识(如 'openai', 'deepseek')
  displayName: string // 显示名称(如 'OpenAI', 'DeepSeek')
  isBuiltin: boolean // 是否为内置供应商

  // 默认配置
  defaultBaseUrl: string // 默认 API 地址
  defaultChatModel?: string // 默认对话模型
  defaultEmbeddingModel?: string // 默认嵌入模型
  defaultRerankModel?: string // 默认重排序模型(未来扩展)
  defaultImageModel?: string // 默认图像生成模型(未来扩展)

  // 能力声明
  capabilities: ProviderCapabilities

  // Provider 工厂函数
  // 用于创建 Provider 实例
  createProvider: (descriptor: ProviderDescriptor) => BaseProvider
}

/**
 * 自定义供应商配置
 * 用户通过 UI 添加自定义供应商时使用的配置
 */
export interface CustomProviderConfig {
  providerName: string // 供应商名称
  displayName: string // 显示名称
  baseUrl: string // API 地址
  apiKey: string // API Key
}
