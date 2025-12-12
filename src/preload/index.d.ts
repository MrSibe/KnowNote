import { ElectronAPI } from '@electron-toolkit/preload'

/**
 * 聊天会话接口
 */
export interface ChatSession {
  id: string
  notebookId: string
  title: string
  summary?: string
  totalTokens?: number
  status?: 'active' | 'archived'
  parentSessionId?: string
  createdAt: number
  updatedAt: number
}

/**
 * 聊天消息接口
 */
export interface ChatMessage {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: any
  createdAt: number
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
  language: 'zh-CN' | 'en-US' | 'ja-JP'
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
        callback: (data: { messageId: string; chunk: string; done: boolean }) => void
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
    }
  }
}
