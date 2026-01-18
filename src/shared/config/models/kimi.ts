import { ModelType } from '../../types'
import type { ProviderLocalModels } from './types'

/**
 * Kimi (Moonshot) 内置模型列表
 * 基于 cherry-studio 和官方文档
 * 最后更新：2025-01-15
 */
export const KIMI_BUILTIN_MODELS: ProviderLocalModels = {
  providerName: 'kimi',
  lastUpdated: '2025-01-15',
  models: [
    // Moonshot v1 系列
    {
      id: 'moonshot-v1-auto',
      type: ModelType.CHAT,
      owned_by: 'moonshot',
      max_context: 128000,
      description: 'Moonshot v1 Auto'
    },
    {
      id: 'moonshot-v1-8k',
      type: ModelType.CHAT,
      owned_by: 'moonshot',
      max_context: 8000,
      description: 'Moonshot v1 8K'
    },
    {
      id: 'moonshot-v1-32k',
      type: ModelType.CHAT,
      owned_by: 'moonshot',
      max_context: 32000,
      description: 'Moonshot v1 32K'
    },
    {
      id: 'moonshot-v1-128k',
      type: ModelType.CHAT,
      owned_by: 'moonshot',
      max_context: 128000,
      description: 'Moonshot v1 128K'
    },

    // Kimi k2 系列
    {
      id: 'kimi-k2-0711-preview',
      type: ModelType.CHAT,
      owned_by: 'moonshot',
      max_context: 200000,
      description: 'Kimi k2 Preview'
    }
  ]
}
