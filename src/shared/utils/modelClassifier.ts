import { Model, ModelType, CategorizedModels } from '../types'

/**
 * 嵌入模型的关键词模式
 */
const EMBEDDING_PATTERNS = [
  /embed/i,
  /bge/i,
  /bce-embedding/i,
  /e5-/i,
  /gte-/i,
  /m3e/i,
  /text-similarity/i,
  /sentence-transformers/i
]

/**
 * 重排序模型的关键词模式
 */
const RERANKER_PATTERNS = [/rerank/i, /cross-encoder/i]

/**
 * 对话模型的关键词模式（白名单）
 */
const CHAT_PATTERNS = [
  /gpt-/i,
  /deepseek/i,
  /qwen/i,
  /claude/i,
  /llama/i,
  /mistral/i,
  /gemini/i,
  /glm/i,
  /kimi/i,
  /minimax/i,
  /yi-/i,
  /chatglm/i,
  /baichuan/i,
  /internlm/i,
  /thinking/i,
  /instruct/i,
  /chat/i
]

/**
 * 多模态/视觉模型关键词
 */
const VISION_PATTERNS = [/-vl/i, /-vision/i, /vision/i, /4v/i, /captioner/i, /omni/i]

/**
 * 图像生成模型关键词
 */
const IMAGE_GEN_PATTERNS = [
  /stable-diffusion/i,
  /sdxl/i,
  /flux/i,
  /dalle/i,
  /midjourney/i,
  /kolors/i
]

/**
 * 音频模型关键词
 */
const AUDIO_PATTERNS = [/whisper/i, /tts/i, /speech/i, /audio/i, /cosyvoice/i, /fish-speech/i]

/**
 * 根据模型ID判断模型类型
 * @param modelId 模型ID
 * @returns 模型类型
 */
export function classifyModel(modelId: string): ModelType {
  const lowerCaseId = modelId.toLowerCase()

  // 优先级1: 明确的特殊类型（避免误判）
  // 重排序模型
  if (RERANKER_PATTERNS.some((pattern) => pattern.test(lowerCaseId))) {
    return ModelType.RERANKER
  }

  // 嵌入模型
  if (EMBEDDING_PATTERNS.some((pattern) => pattern.test(lowerCaseId))) {
    return ModelType.EMBEDDING
  }

  // 优先级2: 多媒体生成模型
  // 图像生成模型
  if (IMAGE_GEN_PATTERNS.some((pattern) => pattern.test(lowerCaseId))) {
    return ModelType.IMAGE
  }

  // 音频模型
  if (AUDIO_PATTERNS.some((pattern) => pattern.test(lowerCaseId))) {
    return ModelType.AUDIO
  }

  // 优先级3: 对话模型（包括多模态对话）
  // 视觉/多模态对话模型也归类为对话模型（因为它们主要用于聊天）
  if (
    CHAT_PATTERNS.some((pattern) => pattern.test(lowerCaseId)) ||
    VISION_PATTERNS.some((pattern) => pattern.test(lowerCaseId))
  ) {
    return ModelType.CHAT
  }

  // 默认返回未知
  return ModelType.UNKNOWN
}

/**
 * 为模型添加类型信息
 * @param model 原始模型对象
 * @returns 带类型信息的模型对象
 */
export function enrichModelWithType(model: Model): Model {
  return {
    ...model,
    type: model.type || classifyModel(model.id)
  }
}

/**
 * 批量为模型添加类型信息
 * @param models 模型列表
 * @returns 带类型信息的模型列表
 */
export function enrichModelsWithType(models: Model[]): Model[] {
  return models.map(enrichModelWithType)
}

/**
 * 对模型列表进行分类
 * @param models 模型列表
 * @returns 分类后的模型对象
 */
export function categorizeModels(models: Model[]): CategorizedModels {
  const enrichedModels = enrichModelsWithType(models)

  return {
    chat: enrichedModels.filter((m) => m.type === ModelType.CHAT),
    embedding: enrichedModels.filter((m) => m.type === ModelType.EMBEDDING),
    reranker: enrichedModels.filter((m) => m.type === ModelType.RERANKER),
    other: enrichedModels.filter(
      (m) =>
        m.type === ModelType.IMAGE ||
        m.type === ModelType.AUDIO ||
        m.type === ModelType.VIDEO ||
        m.type === ModelType.UNKNOWN
    )
  }
}

/**
 * 过滤出对话模型
 * @param models 模型列表
 * @returns 对话模型列表
 */
export function filterChatModels(models: Model[]): Model[] {
  return enrichModelsWithType(models).filter((m) => m.type === ModelType.CHAT)
}

/**
 * 过滤出嵌入模型
 * @param models 模型列表
 * @returns 嵌入模型列表
 */
export function filterEmbeddingModels(models: Model[]): Model[] {
  return enrichModelsWithType(models).filter((m) => m.type === ModelType.EMBEDDING)
}
