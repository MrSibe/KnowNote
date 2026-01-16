import { ModelType } from '../../types'
import type { ProviderLocalModels } from './types'

/**
 * DeepSeek 内置模型列表
 * 基于 cherry-studio 和官方文档
 * 最后更新：2025-01-15
 */
export const DEEPSEEK_BUILTIN_MODELS: ProviderLocalModels = {
  providerName: 'deepseek',
  lastUpdated: '2025-01-15',
  models: [
    { id: 'deepseek-chat', type: ModelType.CHAT, owned_by: 'deepseek', max_context: 64000, description: 'DeepSeek Chat' },
    { id: 'deepseek-reasoner', type: ModelType.CHAT, owned_by: 'deepseek', max_context: 64000, description: 'DeepSeek Reasoner' }
  ]
}
