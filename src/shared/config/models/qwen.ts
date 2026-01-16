import { ModelType } from '../../types'
import type { ProviderLocalModels } from './types'

/**
 * Qwen 内置模型列表 (DashScope)
 * 基于 cherry-studio 和官方文档
 * 最后更新：2025-01-15
 */
export const QWEN_BUILTIN_MODELS: ProviderLocalModels = {
  providerName: 'qwen',
  lastUpdated: '2025-01-15',
  models: [
    // Chat 模型
    {
      id: 'qwen-vl-plus',
      type: ModelType.CHAT,
      owned_by: 'system',
      max_context: 32768,
      description: 'Qwen VL Plus - 多模态'
    },
    {
      id: 'qwen-coder-plus',
      type: ModelType.CHAT,
      owned_by: 'system',
      max_context: 32768,
      description: 'Qwen Coder Plus'
    },
    {
      id: 'qwen-flash',
      type: ModelType.CHAT,
      owned_by: 'system',
      max_context: 8192,
      description: 'Qwen Flash'
    },
    {
      id: 'qwen-plus',
      type: ModelType.CHAT,
      owned_by: 'system',
      max_context: 32768,
      description: 'Qwen Plus'
    },
    {
      id: 'qwen-max',
      type: ModelType.CHAT,
      owned_by: 'system',
      max_context: 32768,
      description: 'Qwen Max'
    },
    {
      id: 'qwen3-max',
      type: ModelType.CHAT,
      owned_by: 'system',
      max_context: 32768,
      description: 'Qwen3 Max'
    },

    // 嵌入模型
    {
      id: 'text-embedding-v4',
      type: ModelType.EMBEDDING,
      owned_by: 'system',
      max_context: 8192,
      description: 'Text Embedding v4'
    },
    {
      id: 'text-embedding-v3',
      type: ModelType.EMBEDDING,
      owned_by: 'system',
      max_context: 8192,
      description: 'Text Embedding v3'
    },
    {
      id: 'text-embedding-v2',
      type: ModelType.EMBEDDING,
      owned_by: 'system',
      max_context: 2048,
      description: 'Text Embedding v2'
    },
    {
      id: 'text-embedding-v1',
      type: ModelType.EMBEDDING,
      owned_by: 'system',
      max_context: 2048,
      description: 'Text Embedding v1'
    },

    // Reranker 模型
    {
      id: 'qwen3-rerank',
      type: ModelType.RERANKER,
      owned_by: 'system',
      max_context: 8192,
      description: 'Qwen3 Rerank'
    }
  ]
}
