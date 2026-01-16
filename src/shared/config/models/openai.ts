import { ModelType } from '../../types'
import type { ProviderLocalModels } from './types'

/**
 * OpenAI 内置模型列表
 * 基于 cherry-studio 和官方文档
 * 最后更新：2025-01-15
 */
export const OPENAI_BUILTIN_MODELS: ProviderLocalModels = {
  providerName: 'openai',
  lastUpdated: '2025-01-15',
  models: [
    // GPT-5 系列（cherry-studio）
    {
      id: 'gpt-5.1',
      type: ModelType.CHAT,
      owned_by: 'openai',
      max_context: 128000,
      description: 'GPT 5.1'
    },
    {
      id: 'gpt-5',
      type: ModelType.CHAT,
      owned_by: 'openai',
      max_context: 128000,
      description: 'GPT 5'
    },
    {
      id: 'gpt-5-mini',
      type: ModelType.CHAT,
      owned_by: 'openai',
      max_context: 128000,
      description: 'GPT 5 Mini'
    },
    {
      id: 'gpt-5-nano',
      type: ModelType.CHAT,
      owned_by: 'openai',
      max_context: 128000,
      description: 'GPT 5 Nano'
    },
    {
      id: 'gpt-5-pro',
      type: ModelType.CHAT,
      owned_by: 'openai',
      max_context: 128000,
      description: 'GPT 5 Pro'
    },
    {
      id: 'gpt-5-chat',
      type: ModelType.CHAT,
      owned_by: 'openai',
      max_context: 128000,
      description: 'GPT 5 Chat'
    },

    // GPT-4 系列
    {
      id: 'gpt-4o',
      type: ModelType.CHAT,
      owned_by: 'openai',
      max_context: 128000,
      description: 'GPT-4o - 最新多模态模型'
    },
    {
      id: 'gpt-4o-mini',
      type: ModelType.CHAT,
      owned_by: 'openai',
      max_context: 128000,
      description: 'GPT-4o Mini'
    },
    {
      id: 'gpt-4-turbo',
      type: ModelType.CHAT,
      owned_by: 'openai',
      max_context: 128000,
      description: 'GPT-4 Turbo'
    },
    {
      id: 'gpt-4',
      type: ModelType.CHAT,
      owned_by: 'openai',
      max_context: 8192,
      description: 'GPT-4'
    },
    {
      id: 'gpt-3.5-turbo',
      type: ModelType.CHAT,
      owned_by: 'openai',
      max_context: 16385,
      description: 'GPT-3.5 Turbo'
    },

    // 图像模型
    { id: 'gpt-image-1', type: ModelType.IMAGE, owned_by: 'openai', description: 'GPT Image 1' },
    { id: 'dall-e-3', type: ModelType.IMAGE, owned_by: 'openai', description: 'DALL-E 3' },
    { id: 'dall-e-2', type: ModelType.IMAGE, owned_by: 'openai', description: 'DALL-E 2' },

    // Embedding 模型
    {
      id: 'text-embedding-3-large',
      type: ModelType.EMBEDDING,
      owned_by: 'openai',
      max_context: 8191,
      description: 'Embedding v3 Large - 3072维'
    },
    {
      id: 'text-embedding-3-small',
      type: ModelType.EMBEDDING,
      owned_by: 'openai',
      max_context: 8191,
      description: 'Embedding v3 Small - 1536维'
    },
    {
      id: 'text-embedding-ada-002',
      type: ModelType.EMBEDDING,
      owned_by: 'openai',
      max_context: 8191,
      description: 'Embedding Ada 002'
    },

    // 音频模型
    {
      id: 'whisper-1',
      type: ModelType.AUDIO,
      owned_by: 'openai',
      description: 'Whisper - 语音转文字'
    },
    { id: 'tts-1', type: ModelType.AUDIO, owned_by: 'openai', description: 'TTS v1' },
    { id: 'tts-1-hd', type: ModelType.AUDIO, owned_by: 'openai', description: 'TTS v1 HD' }
  ]
}
