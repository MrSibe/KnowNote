/**
 * 共享的类型定义
 * 基于 Drizzle 推导的数据库 schema,确保类型定义的单一数据源
 */

// 导出知识库类型
export * from './knowledge'

// 导出聊天类型
export * from './chat'

// 导出 Result 错误处理类型
export * from './result'

/**
 * 笔记本接口
 * 与 Drizzle schema 推导的类型兼容
 */
export interface Notebook {
  id: string
  title: string
  description?: string | null | undefined // 兼容 Drizzle 推导的可选字段
  createdAt: Date
  updatedAt: Date
}

/**
 * 笔记接口
 * 与 Drizzle schema 推导的类型兼容
 */
export interface Note {
  id: string
  notebookId: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Provider 配置接口
 */
export interface ProviderConfig {
  providerName: string
  config: any
  enabled: boolean
  updatedAt: number
}

/**
 * 模型类型枚举
 */
export enum ModelType {
  CHAT = 'chat',
  EMBEDDING = 'embedding',
  RERANKER = 'reranker',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  UNKNOWN = 'unknown'
}

/**
 * 模型接口
 */
export interface Model {
  id: string
  object: string
  owned_by?: string
  created?: number
  type?: ModelType
}

/**
 * 分类后的模型列表接口
 */
export interface CategorizedModels {
  chat: Model[]
  embedding: Model[]
  reranker: Model[]
  other: Model[]
}

/**
 * 应用设置接口
 */
export interface AppSettings {
  theme: 'light' | 'dark'
  language: 'zh-CN' | 'en-US'
  autoLaunch: boolean
  defaultChatModel?: string // 默认对话模型
  defaultEmbeddingModel?: string // 默认嵌入模型
  prompts?: {
    mindMap?: {
      'zh-CN'?: string // 中文思维导图生成提示词
      'en-US'?: string // 英文思维导图生成提示词
    }
  }
}
