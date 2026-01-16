import { ModelType } from '../../types'
import type { ProviderLocalModels } from './types'

/**
 * 智谱 AI 内置模型列表
 * 基于 cherry-studio 和官方文档
 * 最后更新：2025-01-15
 */
export const ZHIPU_BUILTIN_MODELS: ProviderLocalModels = {
  providerName: 'zhipu',
  lastUpdated: '2025-01-15',
  models: [
    // GLM-4.5 系列
    { id: 'glm-4.5-flash', type: ModelType.CHAT, owned_by: 'zhipu', max_context: 128000, description: 'GLM-4.5-Flash' },
    { id: 'glm-4.5', type: ModelType.CHAT, owned_by: 'zhipu', max_context: 128000, description: 'GLM-4.5' },
    { id: 'glm-4.5-air', type: ModelType.CHAT, owned_by: 'zhipu', max_context: 128000, description: 'GLM-4.5-Air' },
    { id: 'glm-4.5-airx', type: ModelType.CHAT, owned_by: 'zhipu', max_context: 128000, description: 'GLM-4.5-AirX' },
    { id: 'glm-4.5v', type: ModelType.CHAT, owned_by: 'zhipu', max_context: 8192, description: 'GLM-4.5V - 多模态' },

    // GLM-4.6 系列
    { id: 'glm-4.6', type: ModelType.CHAT, owned_by: 'zhipu', max_context: 128000, description: 'GLM-4.6' },
    { id: 'glm-4.6v', type: ModelType.CHAT, owned_by: 'zhipu', max_context: 8192, description: 'GLM-4.6V - 多模态' },
    { id: 'glm-4.6v-flash', type: ModelType.CHAT, owned_by: 'zhipu', max_context: 8192, description: 'GLM-4.6V-Flash - 多模态' },
    { id: 'glm-4.6v-flashx', type: ModelType.CHAT, owned_by: 'zhipu', max_context: 8192, description: 'GLM-4.6V-FlashX - 多模态' },

    // GLM-4.7 系列
    { id: 'glm-4.7', type: ModelType.CHAT, owned_by: 'zhipu', max_context: 128000, description: 'GLM-4.7' },

    // 嵌入模型
    { id: 'embedding-3', type: ModelType.EMBEDDING, owned_by: 'zhipu', max_context: 2048, description: 'Embedding-3' }
  ]
}
