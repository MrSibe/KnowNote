/// <reference types="vite/client" />

interface Window {
  api: {
    // 窗口设置相关
    openSettings: () => Promise<void>

    // 应用设置相关
    settings: {
      getAll: () => Promise<any>
      get: (key: string) => Promise<any>
      update: (updates: any) => Promise<void>
      set: (key: string, value: any) => Promise<void>
      reset: () => Promise<void>
      onSettingsChange: (callback: (newSettings: any, oldSettings: any) => void) => () => void
    }

    // Notebook 相关
    createNotebook: (title: string, description?: string) => Promise<any>
    getAllNotebooks: () => Promise<any[]>
    getNotebook: (id: string) => Promise<any>
    updateNotebook: (id: string, updates: any) => Promise<void>
    deleteNotebook: (id: string) => Promise<void>

    // Note 相关
    createNote: (notebookId: string, content: string, customTitle?: string) => Promise<any>
    getNotes: (notebookId: string) => Promise<any[]>
    getNote: (id: string) => Promise<any>
    updateNote: (id: string, updates: any) => Promise<void>
    deleteNote: (id: string) => Promise<void>

    // Chat Session 相关
    createChatSession: (notebookId: string, title: string) => Promise<any>
    getChatSessions: (notebookId: string) => Promise<any[]>
    getActiveSession: (notebookId: string) => Promise<any>
    updateSessionTitle: (sessionId: string, title: string) => Promise<void>
    deleteSession: (sessionId: string) => Promise<void>

    // Chat Message 相关
    getMessages: (sessionId: string) => Promise<any>
    sendMessage: (sessionId: string, content: string) => Promise<any>

    // 流式消息监听
    onMessageChunk: (callback: (data: any) => void) => () => void
    onMessageError: (callback: (data: any) => void) => () => void

    // Session 自动切换监听
    onSessionAutoSwitched: (callback: (data: any) => void) => () => void

    // Provider 配置相关
    saveProviderConfig: (config: any) => Promise<any>
    getProviderConfig: (providerName: string) => Promise<any>
    getAllProviderConfigs: () => Promise<any[]>
    validateProviderConfig: (providerName: string, config: any) => Promise<any>
    fetchModels: (providerName: string, apiKey: string) => Promise<any>
    getProviderModels: (providerName: string) => Promise<any>

    // Provider 配置变更监听
    onProviderConfigChanged: (callback: () => void) => () => void
  }

  electron: any
}
