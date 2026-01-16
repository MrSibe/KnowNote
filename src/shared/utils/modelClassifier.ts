import { Model, ModelType, CategorizedModels } from '../types'
import { getAllBuiltinModels } from '../config/models'

/**
 * 内置模型类型缓存（用于快速查找）
 */
let builtinModelTypeCache: Map<string, ModelType> | null = null

/**
 * 初始化内置模型类型缓存
 */
function initBuiltinModelTypeCache(): Map<string, ModelType> {
  if (builtinModelTypeCache) {
    return builtinModelTypeCache
  }

  const cache = new Map<string, ModelType>()
  const allBuiltinModels = getAllBuiltinModels()

  // 遍历所有 provider 的内置模型
  for (const models of Object.values(allBuiltinModels)) {
    for (const model of models) {
      // 内置模型保证有 type 字段
      if (model.type) {
        cache.set(model.id, model.type)
      }
    }
  }

  builtinModelTypeCache = cache
  return cache
}

/**
 * 从内置配置中查找模型类型
 * @param modelId 模型ID
 * @returns 模型类型，如果未找到返回 undefined
 */
function getBuiltinModelType(modelId: string): ModelType | undefined {
  const cache = initBuiltinModelTypeCache()
  return cache.get(modelId)
}

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
 * 优先级：
 * 1. 内置配置文件中定义的类型
 * 2. 模型对象自带的 type 字段（API 返回）
 * 3. 基于模型名称的自动分类
 * @param model 原始模型对象
 * @returns 带类型信息的模型对象
 */
export function enrichModelWithType(model: Model): Model {
  // 1. 优先使用内置配置文件中定义的类型
  const builtinType = getBuiltinModelType(model.id)
  if (builtinType) {
    return {
      ...model,
      type: builtinType
    }
  }

  // 2. 使用模型对象自带的 type 字段，或使用自动分类
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

/**
 * 智能合并内置模型和远程模型
 *
 * 合并策略:
 * - 远程字段优先: id, owned_by, created, object (反映最新状态)
 * - 内置字段优先: type, max_context, description (精心配置的元数据)
 * - 远程新增模型: 自动分类 type 后添加
 * - 内置独有模型: 保留 (防止远程 API 遗漏)
 *
 * @param builtinModels 内置模型列表
 * @param remoteModels 远程 API 获取的模型列表
 * @returns 合并后的模型列表
 *
 * @example
 * // 内置模型: [{ id: 'gpt-4o', type: 'chat', max_context: 128000 }]
 * // 远程模型: [{ id: 'gpt-4o', created: 1715367049, owned_by: 'openai' }]
 * // 合并结果: [{ id: 'gpt-4o', type: 'chat', max_context: 128000, created: 1715367049, owned_by: 'openai' }]
 */
export function mergeModels(builtinModels: Model[], remoteModels: Model[]): Model[] {
  const builtinMap = new Map(builtinModels.map((m) => [m.id, m]))
  const remoteMap = new Map(remoteModels.map((m) => [m.id, m]))

  const merged: Model[] = []

  // 1. 遍历所有远程模型
  for (const remote of remoteModels) {
    const builtin = builtinMap.get(remote.id)

    if (builtin) {
      // 同时存在:智能合并
      // 远程字段提供最新的基础信息,内置字段提供精确的元数据
      merged.push({
        ...remote, // 远程字段 (id, object, owned_by, created)
        type: builtin.type, // 内置字段优先
        max_context: builtin.max_context,
        description: builtin.description
      })
    } else {
      // 仅远程有:直接添加 (自动分类 type)
      merged.push(enrichModelWithType(remote))
    }
  }

  // 2. 添加仅内置有的模型 (防止远程 API 遗漏)
  for (const builtin of builtinModels) {
    if (!remoteMap.has(builtin.id)) {
      merged.push(builtin)
    }
  }

  return merged
}
