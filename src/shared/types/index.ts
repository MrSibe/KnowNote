/**
 * 共享的类型定义
 */

// 导出知识库类型
export * from './knowledge'

/**
 * 笔记本接口
 */
export interface Notebook {
  id: string
  title: string
  description?: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * 笔记接口
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
}
