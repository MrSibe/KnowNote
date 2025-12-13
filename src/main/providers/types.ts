/**
 * AI Provider 接口定义
 * 所有 AI Provider 必须实现此接口
 */

import type { APIMessage, StreamChunk } from '../../shared/types/chat'

// 重新导出共享类型，方便其他地方使用
export type { APIMessage as ChatMessage, StreamChunk }

/**
 * Provider 配置
 */
export interface LLMProviderConfig {
  apiKey?: string
  baseUrl?: string
  model?: string
  temperature?: number
  maxTokens?: number
  [key: string]: any
}

/**
 * Embedding 配置
 */
export interface EmbeddingConfig {
  model?: string // embedding 模型名称
  dimensions?: number // 向量维度（部分模型支持）
}

/**
 * Embedding 结果
 */
export interface EmbeddingResult {
  embedding: Float32Array // 向量数据
  model: string // 使用的模型
  dimensions: number // 向量维度
  tokensUsed: number // 消耗的 token 数
}

/**
 * AI Provider 接口
 */
export interface LLMProvider {
  /**
   * Provider 名称
   */
  readonly name: string

  /**
   * 配置 Provider
   * @param config - Provider 配置项
   */
  configure(config: LLMProviderConfig): void

  /**
   * 流式发送消息
   * @param messages - 聊天消息历史
   * @param onChunk - 接收到新 chunk 时的回调
   * @param onError - 发生错误时的回调
   * @param onComplete - 完成时的回调
   */
  sendMessageStream(
    messages: APIMessage[],
    onChunk: (chunk: StreamChunk) => void,
    onError: (error: Error) => void,
    onComplete: () => void
  ): Promise<void>

  /**
   * 验证配置是否有效（可选）
   * @param config - 需要验证的配置
   * @returns Promise<boolean> - 配置是否有效
   */
  validateConfig?(config: LLMProviderConfig): Promise<boolean>

  /**
   * 检查是否支持 Embedding（可选）
   * @returns boolean - 是否支持 Embedding
   */
  supportsEmbedding?(): boolean

  /**
   * 生成单个文本的 Embedding（可选）
   * @param text - 输入文本
   * @param config - Embedding 配置
   */
  createEmbedding?(text: string, config?: EmbeddingConfig): Promise<EmbeddingResult>

  /**
   * 批量生成 Embedding（可选）
   * @param texts - 输入文本数组
   * @param config - Embedding 配置
   */
  createEmbeddings?(texts: string[], config?: EmbeddingConfig): Promise<EmbeddingResult[]>

  /**
   * 获取默认 Embedding 模型（可选）
   */
  getDefaultEmbeddingModel?(): string
}
