import { Model } from '../../types'
import { OPENAI_BUILTIN_MODELS } from './openai'
import { DEEPSEEK_BUILTIN_MODELS } from './deepseek'
import { SILICONFLOW_BUILTIN_MODELS } from './siliconflow'
import { QWEN_BUILTIN_MODELS } from './qwen'
import { ZHIPU_BUILTIN_MODELS } from './zhipu'
import { KIMI_BUILTIN_MODELS } from './kimi'
import { OLLAMA_BUILTIN_MODELS } from './ollama'
import type { ProviderLocalModels, LocalModelDefinition } from './types'

/**
 * 所有 Provider 的内置模型配置
 */
const BUILTIN_MODELS_MAP: Record<string, ProviderLocalModels> = {
  openai: OPENAI_BUILTIN_MODELS,
  deepseek: DEEPSEEK_BUILTIN_MODELS,
  siliconflow: SILICONFLOW_BUILTIN_MODELS,
  qwen: QWEN_BUILTIN_MODELS,
  zhipu: ZHIPU_BUILTIN_MODELS,
  kimi: KIMI_BUILTIN_MODELS,
  ollama: OLLAMA_BUILTIN_MODELS
}

/**
 * 将本地模型定义转换为标准 Model 对象
 */
function convertToModel(def: LocalModelDefinition, providerName: string): Model {
  return {
    id: def.id,
    object: 'model',
    owned_by: def.owned_by,
    type: def.type,
    // 将 lastUpdated 转为 created 时间戳（Unix timestamp）
    created: Math.floor(
      new Date(BUILTIN_MODELS_MAP[providerName]?.lastUpdated || Date.now()).getTime() / 1000
    )
  }
}

/**
 * 获取指定 Provider 的内置模型列表
 * @param providerName Provider 名称
 * @returns 内置模型列表，如果未找到则返回空数组
 */
export function getBuiltinModels(providerName: string): Model[] {
  const config = BUILTIN_MODELS_MAP[providerName]
  if (!config) {
    return []
  }

  return config.models.map((model) => convertToModel(model, providerName))
}

/**
 * 检查是否有内置模型配置
 * @param providerName Provider 名称
 * @returns 是否存在内置模型配置
 */
export function hasBuiltinModels(providerName: string): boolean {
  return providerName in BUILTIN_MODELS_MAP
}

/**
 * 获取所有 Provider 的内置模型列表
 * @returns 所有内置模型的映射表 { providerName: Model[] }
 */
export function getAllBuiltinModels(): Record<string, Model[]> {
  const result: Record<string, Model[]> = {}

  for (const providerName in BUILTIN_MODELS_MAP) {
    result[providerName] = getBuiltinModels(providerName)
  }

  return result
}

/**
 * 根据类型过滤内置模型
 * @param providerName Provider 名称
 * @param type 模型类型
 * @returns 过滤后的模型列表
 */
export function getBuiltinModelsByType(providerName: string, type: string): Model[] {
  const models = getBuiltinModels(providerName)
  return models.filter((m) => m.type === type)
}

/**
 * 获取内置模型的统计信息
 */
export function getBuiltinModelsStats(): {
  totalProviders: number
  totalModels: number
  byProvider: Record<string, number>
  byType: Record<string, number>
} {
  const byProvider: Record<string, number> = {}
  const byType: Record<string, number> = {}
  let totalModels = 0

  for (const providerName in BUILTIN_MODELS_MAP) {
    const models = BUILTIN_MODELS_MAP[providerName].models
    byProvider[providerName] = models.length
    totalModels += models.length

    models.forEach((model) => {
      const type = model.type.toString()
      byType[type] = (byType[type] || 0) + 1
    })
  }

  return {
    totalProviders: Object.keys(BUILTIN_MODELS_MAP).length,
    totalModels,
    byProvider,
    byType
  }
}

// 导出类型
export * from './types'
