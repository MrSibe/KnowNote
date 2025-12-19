import { ElectronAPI } from '@electron-toolkit/preload'
import type { ChatSession, ChatMessage } from '../shared/types/chat'
import type { Notebook, Note, ProviderConfig, AppSettings } from '../shared/types'
import type {
  KnowledgeDocument,
  KnowledgeChunk,
  KnowledgeSearchResult,
  KnowledgeStats,
  AddDocumentOptions,
  SearchOptions,
  IndexProgress
} from '../shared/types/knowledge'
import type { UpdateState, UpdateCheckResult, UpdateOperationResult } from '../shared/types/update'
import type { MindMap } from '../main/db/schema'

// 重新导出共享类型
export type { ChatSession, ChatMessage, Notebook, Note, ProviderConfig, AppSettings, MindMap }
export type {
  KnowledgeDocument,
  KnowledgeChunk,
  KnowledgeSearchResult,
  KnowledgeStats,
  AddDocumentOptions,
  SearchOptions,
  IndexProgress
}
export type { UpdateState, UpdateCheckResult, UpdateOperationResult }

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      // 窗口设置相关
      openSettings: () => Promise<void>

      // 获取平台信息
      getPlatform: () => Promise<string>

      // 获取应用版本号
      getAppVersion: () => Promise<string>

      // 在默认浏览器中打开外部链接
      openExternalUrl: (url: string) => Promise<{ success: boolean; error?: string }>

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

      // Note 相关
      createNote: (notebookId: string, content: string, customTitle?: string) => Promise<Note>
      getNotes: (notebookId: string) => Promise<Note[]>
      getNote: (id: string) => Promise<Note | null>
      updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => Promise<void>
      deleteNote: (id: string) => Promise<void>

      // Items 相关（统一管理笔记、思维导图等）
      items: {
        getAll: (notebookId: string) => Promise<any[]>
        updateOrder: (itemId: string, order: number) => Promise<{ success: boolean }>
        batchUpdateOrder: (updates: Record<string, number>) => Promise<{ success: boolean }>
        delete: (itemId: string, deleteResource?: boolean) => Promise<{ success: boolean }>
      }

      // Mind Map 相关
      mindmap: {
        getLatest: (notebookId: string) => Promise<MindMap | null>
        get: (mindMapId: string) => Promise<MindMap | null>
        generate: (
          notebookId: string
        ) => Promise<{ success: boolean; mindMapId?: string; error?: string }>
        getNodeChunks: (mindMapId: string, nodeId: string) => Promise<any[]>
        update: (
          mindMapId: string,
          updates: Partial<Pick<MindMap, 'title'>>
        ) => Promise<{ success: boolean }>
        delete: (mindMapId: string) => Promise<{ success: boolean }>
        openWindow: (notebookId: string, mindMapId?: string) => Promise<void>
        onProgress: (
          callback: (data: { notebookId: string; stage: string; progress: number }) => void
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
      abortMessage: (messageId: string) => Promise<{ success: boolean; reason?: string }>

      // 流式消息监听（AI SDK 流式协议格式）
      onMessageChunk: (
        callback: (data: {
          messageId: string
          type: 'reasoning-start' | 'reasoning-delta' | 'reasoning-end' | 'text-delta' | 'finish'
          content?: string
          reasoningId?: string
          metadata?: any
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
      deleteProviderConfig: (providerName: string) => Promise<void>
      validateProviderConfig: (providerName: string, config: any) => Promise<boolean>
      fetchModels: (
        providerName: string,
        apiKey: string
      ) => Promise<{ id: string; object: string; owned_by?: string; created?: number }[]>
      getProviderModels: (
        providerName: string
      ) => Promise<{ id: string; object: string; owned_by?: string; created?: number }[]>
      onProviderConfigChanged: (callback: () => void) => () => void

      // 知识库相关
      knowledge: {
        // 添加文档
        addDocument: (
          notebookId: string,
          options: AddDocumentOptions
        ) => Promise<{ success: boolean; documentId?: string; error?: string }>
        addDocumentFromFile: (
          notebookId: string,
          filePath: string
        ) => Promise<{ success: boolean; documentId?: string; error?: string }>
        addDocumentFromUrl: (
          notebookId: string,
          url: string
        ) => Promise<{ success: boolean; documentId?: string; error?: string }>
        addNote: (
          notebookId: string,
          noteId: string
        ) => Promise<{ success: boolean; documentId?: string; error?: string }>

        // 搜索
        search: (
          notebookId: string,
          query: string,
          options?: SearchOptions
        ) => Promise<{ success: boolean; results: KnowledgeSearchResult[]; error?: string }>

        // 文档管理
        getDocuments: (notebookId: string) => Promise<KnowledgeDocument[]>
        getDocument: (documentId: string) => Promise<KnowledgeDocument | null>
        getDocumentChunks: (documentId: string) => Promise<KnowledgeChunk[]>
        deleteDocument: (documentId: string) => Promise<{ success: boolean; error?: string }>
        reindexDocument: (documentId: string) => Promise<{ success: boolean; error?: string }>

        // 统计
        getStats: (notebookId: string) => Promise<KnowledgeStats>

        // 文件选择对话框
        selectFiles: () => Promise<string[]>

        // 打开源文件
        openSource: (documentId: string) => Promise<{ success: boolean; error?: string }>

        // 索引进度监听
        onIndexProgress: (callback: (progress: IndexProgress) => void) => () => void
      }

      // 应用更新相关
      update: {
        // 检查更新
        check: () => Promise<UpdateCheckResult>
        // 下载更新
        download: () => Promise<UpdateOperationResult>
        // 安装更新（退出并安装）
        install: () => Promise<UpdateOperationResult>
        // 获取当前更新状态
        getState: () => Promise<UpdateCheckResult>
        // 监听更新状态变化
        onStateChanged: (callback: (state: UpdateState) => void) => () => void
      }
    }
  }
}
