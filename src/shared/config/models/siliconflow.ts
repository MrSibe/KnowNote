import { ModelType } from '../../types'
import type { ProviderLocalModels } from './types'

/**
 * SiliconFlow 内置模型列表
 * 基于 cherry-studio 和官方文档
 * 最后更新：2025-01-15
 */
export const SILICONFLOW_BUILTIN_MODELS: ProviderLocalModels = {
  providerName: 'siliconflow',
  lastUpdated: '2025-01-15',
  models: [
    // Chat 模型
    { id: 'deepseek-ai/DeepSeek-V3.2', type: ModelType.CHAT, owned_by: 'deepseek-ai', max_context: 64000, description: 'DeepSeek V3.2' },
    { id: 'Qwen/Qwen3-8B', type: ModelType.CHAT, owned_by: 'Qwen', max_context: 32768, description: 'Qwen3 8B' },

    // 嵌入模型
    { id: 'BAAI/bge-m3', type: ModelType.EMBEDDING, owned_by: 'BAAI', max_context: 8191, description: 'BGE M3 - 多语言' }
  ]
}
