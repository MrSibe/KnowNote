import { ElectronAPI } from '@electron-toolkit/preload'
import type { ChatSession, ChatMessage } from '../shared/types/chat'

// 重新导出共享类型
export type { ChatSession, ChatMessage }

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

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      // 窗口设置相关
      openSettings: () => Promise<void>

      // 应用设置相关
      settings: {
        getAll: () => Promise<AppSettings>
        get: <K extends keyof AppSettings>(key: K) => Promise<AppSettings[K]>
        update: (updates: Partial<AppSettings>) => Promise<AppSettings>
        set: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<AppSettings[K]>
        reset: () => Promise<AppSettings>
        onSettingsChange: (
          callback: (newSettings: AppSettings, oldSettings: AppSettings) => void
        ) => () => void
      }

      // Notebook 相关
      createNotebook: (title: string, description?: string) => Promise<Notebook>
      getAllNotebooks: () => Promise<Notebook[]>
      getNotebook: (id: string) => Promise<Notebook | null>
      updateNotebook: (
        id: string,
        updates: Partial<Pick<Notebook, 'title' | 'description'>>
      ) => Promise<void>
      deleteNotebook: (id: string) => Promise<void>

      // Chat Session 相关
      createChatSession: (notebookId: string, title: string) => Promise<ChatSession>
      getChatSessions: (notebookId: string) => Promise<ChatSession[]>
      getActiveSession: (notebookId: string) => Promise<ChatSession | null>
      updateSessionTitle: (sessionId: string, title: string) => Promise<void>
      deleteSession: (sessionId: string) => Promise<void>

      // Chat Message 相关
      getMessages: (sessionId: string) => Promise<ChatMessage[]>
      sendMessage: (sessionId: string, content: string) => Promise<string>

      // 流式消息监听
      onMessageChunk: (
        callback: (data: {
          messageId: string
          chunk: string
          reasoningChunk?: string
          done: boolean
          reasoningDone?: boolean
        }) => void
      ) => () => void
      onMessageError: (callback: (data: { messageId: string; error: string }) => void) => () => void

      // Session 自动切换监听
      onSessionAutoSwitched: (
        callback: (data: { oldSessionId: string; newSessionId: string }) => void
      ) => () => void

      // Provider 配置相关
      saveProviderConfig: (config: ProviderConfig) => Promise<void>
      getProviderConfig: (providerName: string) => Promise<ProviderConfig | null>
      getAllProviderConfigs: () => Promise<ProviderConfig[]>
      validateProviderConfig: (providerName: string, config: any) => Promise<boolean>
      fetchModels: (
        providerName: string,
        apiKey: string
      ) => Promise<{ id: string; object: string; owned_by?: string; created?: number }[]>
      onProviderConfigChanged: (callback: () => void) => () => void
    }
  }
}
