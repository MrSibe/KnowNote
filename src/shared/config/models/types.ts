import { ModelType } from '../../types'

/**
 * 本地模型定义（简化版，用于静态配置）
 */
export interface LocalModelDefinition {
  id: string
  type: ModelType
  owned_by?: string
  max_context?: number // 最大上下文长度
  description?: string // 模型描述（可选）
}

/**
 * Provider 本地模型列表配置
 */
export interface ProviderLocalModels {
  providerName: string
  lastUpdated: string // ISO 日期字符串，便于追踪更新时间
  models: LocalModelDefinition[]
}
