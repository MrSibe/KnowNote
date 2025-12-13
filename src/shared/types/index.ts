/**
 * 共享的类型定义
 */

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
 * 应用设置接口
 */
export interface AppSettings {
  theme: 'light' | 'dark'
  language: 'zh-CN' | 'en-US'
  autoLaunch: boolean
  defaultModel?: string
}