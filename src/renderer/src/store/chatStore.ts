import { create } from 'zustand'
import type { ChatSession, ChatMessage } from '../types/notebook'

interface ChatStore {
  // 当前会话
  currentSession: ChatSession | null

  // 会话列表（按 notebook 分组）
  sessions: ChatSession[]

  // 消息列表（当前会话）
  messages: ChatMessage[]

  // 流式消息状态：按notebookId管理
  streamingMessages: Record<string, string>

  // messageId -> {notebookId, content, timeoutId} 映射，用于切换notebook后仍能清理流式状态和恢复内容
  messageToNotebook: Record<string, { notebookId: string; content: string; timeoutId?: number }>

  // Actions
  setCurrentSession: (session: ChatSession | null) => void
  setSessions: (sessions: ChatSession[]) => void
  setMessages: (messages: ChatMessage[]) => void

  addMessage: (message: ChatMessage) => void
  updateMessageContent: (messageId: string, content: string) => void
  setStreamingMessage: (notebookId: string, messageId: string | null) => void
  isNotebookStreaming: (notebookId: string) => boolean

  // 异步操作
  loadSessions: (notebookId: string) => Promise<void>
  loadActiveSession: (notebookId: string) => Promise<void>
  loadMessages: (sessionId: string) => Promise<void>
  createSession: (notebookId: string, title: string) => Promise<ChatSession>
  sendMessage: (sessionId: string, content: string) => Promise<void>
}

export const useChatStore = create<ChatStore>()((set, get) => ({
  currentSession: null,
  sessions: [],
  messages: [],
  streamingMessages: {},
  messageToNotebook: {},

  setCurrentSession: (session) => set({ currentSession: session }),
  setSessions: (sessions) => set({ sessions }),
  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message]
    })),

  updateMessageContent: (messageId, content) =>
    set((state) => ({
      messages: state.messages.map((msg) => (msg.id === messageId ? { ...msg, content } : msg))
    })),

  setStreamingMessage: (notebookId, messageId) =>
    set((state) => {
      const newStreamingMessages = { ...state.streamingMessages }

      if (messageId) {
        // 设置该Notebook的流式消息
        newStreamingMessages[notebookId] = messageId
      } else {
        // 清除该Notebook的流式消息
        delete newStreamingMessages[notebookId]
      }

      return {
        streamingMessages: newStreamingMessages,
        messages: state.messages.map((msg) => ({
          ...msg,
          isStreaming: msg.id === messageId && !!messageId
        }))
      }
    }),

  isNotebookStreaming: (notebookId) => {
    const state = get()
    return !!state.streamingMessages[notebookId]
  },

  loadSessions: async (notebookId) => {
    const sessions = await window.api.getChatSessions(notebookId)
    set({ sessions })
  },

  loadActiveSession: async (notebookId) => {
    const activeSession = await window.api.getActiveSession(notebookId)

    if (activeSession) {
      // 找到活跃session，设置为当前session
      set({ currentSession: activeSession })
      await get().loadMessages(activeSession.id)
    } else {
      // 没有活跃session，创建第一个
      const newSession = await get().createSession(notebookId, `Session ${Date.now()}`)
      set({ currentSession: newSession })
    }
  },

  loadMessages: async (sessionId) => {
    const dbMessages = await window.api.getMessages(sessionId)

    // 从缓存中恢复正在流式传输的消息内容
    const state = get()
    const messages = dbMessages.map((msg: ChatMessage) => {
      const cached = state.messageToNotebook[msg.id]
      if (cached && cached.content) {
        // 如果缓存中有内容，说明这条消息正在流式传输，使用缓存的内容
        return { ...msg, content: cached.content, isStreaming: true }
      }
      return msg
    })

    set({ messages })
  },

  createSession: async (notebookId, title) => {
    const session = await window.api.createChatSession(notebookId, title)
    set((state) => ({
      sessions: [session, ...state.sessions],
      currentSession: session
    }))
    return session
  },

  sendMessage: async (sessionId, content) => {
    // 1. 找到session对应的notebookId
    const session = get().currentSession
    if (!session) return

    const notebookId = session.notebookId

    // 2. 添加用户消息到 UI
    const userMessage: ChatMessage = {
      id: `temp_user_${Date.now()}`,
      sessionId,
      notebookId,
      role: 'user',
      content,
      createdAt: Date.now()
    }
    get().addMessage(userMessage)

    // 3. 发送消息并获取 assistant messageId
    const messageId = await window.api.sendMessage(sessionId, content)

    // 4. 添加 assistant 消息占位符
    const assistantMessage: ChatMessage = {
      id: messageId,
      sessionId,
      notebookId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
      isStreaming: true
    }
    get().addMessage(assistantMessage)
    get().setStreamingMessage(notebookId, messageId)

    // 5. 初始化缓存，记录 messageId -> {notebookId, content}，并设置30秒超时清理
    const timeoutId = window.setTimeout(() => {
      console.warn(`[ChatStore] 流式消息超时，清理缓存: ${messageId}`)
      const state = get()
      const cached = state.messageToNotebook[messageId]

      if (cached) {
        // 清除流式状态
        state.setStreamingMessage(cached.notebookId, null)

        // 更新消息为超时状态
        const message = state.messages.find((m) => m.id === messageId)
        if (message) {
          state.updateMessageContent(messageId, cached.content || '⚠️ 消息接收超时，请重试')
        }

        // 清理缓存
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [messageId]: _removed, ...rest } = state.messageToNotebook
        useChatStore.setState({ messageToNotebook: rest })
      }
    }, 30000) // 30秒超时

    set((state) => ({
      messageToNotebook: {
        ...state.messageToNotebook,
        [messageId]: { notebookId, content: '', timeoutId }
      }
    }))
  }
}))

/**
 * 设置流式消息监听器
 * 在应用启动时调用一次
 * 返回清理函数
 */
export function setupChatListeners() {
  // 监听流式消息片段
  const cleanupChunk = window.api.onMessageChunk((data) => {
    const { messageId, chunk, done } = data
    const store = useChatStore.getState()

    // 1. 先更新缓存（即使消息不在当前 messages 中也要缓存）
    const cached = store.messageToNotebook[messageId]
    if (cached) {
      const newContent = cached.content + chunk
      useChatStore.setState((state) => ({
        messageToNotebook: {
          ...state.messageToNotebook,
          [messageId]: { ...cached, content: newContent }
        }
      }))

      // 2. 如果消息在当前 messages 中，也更新它
      const message = store.messages.find((m) => m.id === messageId)
      if (message) {
        store.updateMessageContent(messageId, newContent)
      }
    }

    // 完成流式传输
    if (done) {
      const cached = store.messageToNotebook[messageId]
      if (cached) {
        // 清除超时定时器
        if (cached.timeoutId) {
          window.clearTimeout(cached.timeoutId)
        }

        store.setStreamingMessage(cached.notebookId, null)

        // 清理缓存
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [messageId]: _removed, ...rest } = store.messageToNotebook
        useChatStore.setState({ messageToNotebook: rest })
      }
    }
  })

  // 监听错误
  const cleanupError = window.api.onMessageError((data) => {
    const { messageId, error } = data
    const store = useChatStore.getState()

    const errorContent = `❌ 错误: ${error}`

    // 更新缓存
    const cached = store.messageToNotebook[messageId]
    if (cached) {
      // 清除超时定时器
      if (cached.timeoutId) {
        window.clearTimeout(cached.timeoutId)
      }

      useChatStore.setState((state) => ({
        messageToNotebook: {
          ...state.messageToNotebook,
          [messageId]: { ...cached, content: errorContent }
        }
      }))

      // 如果消息在当前 messages 中，也更新它
      const message = store.messages.find((m) => m.id === messageId)
      if (message) {
        store.updateMessageContent(messageId, errorContent)
      }

      // 清除流式状态和缓存
      store.setStreamingMessage(cached.notebookId, null)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [messageId]: _removed, ...rest } = store.messageToNotebook
      useChatStore.setState({ messageToNotebook: rest })
    }
  })

  // 监听 Session 自动切换
  const cleanupAutoSwitch = window.api.onSessionAutoSwitched(async (data) => {
    const { newSessionId } = data
    const store = useChatStore.getState()

    console.log(`[ChatStore] Session 自动切换到: ${newSessionId}`)

    // 静默切换到新session
    if (store.currentSession) {
      const newSession = await window.api.getActiveSession(store.currentSession.notebookId)

      if (newSession && newSession.id === newSessionId) {
        // 静默切换到新session，保持当前消息显示，用户无感知
        store.setCurrentSession(newSession)
      }
    }
  })

  // 返回清理函数
  return () => {
    cleanupChunk()
    cleanupError()
    cleanupAutoSwitch()
  }
}
