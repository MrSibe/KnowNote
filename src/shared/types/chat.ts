/**
 * 统一的聊天相关类型定义
 * 此文件被 main、renderer、preload 三个进程共享
 */

/**
 * 聊天会话接口（完整版）
 */
export interface ChatSession {
  id: string
  notebookId: string
  title: string
  summary?: string
  totalTokens: number
  status: 'active' | 'archived'
  parentSessionId?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * 聊天消息接口（完整版）
 */
export interface ChatMessage {
  id: string
  sessionId: string
  notebookId?: string // 用于并发消息管理
  role: 'user' | 'assistant' | 'system'
  content: string
  reasoningContent?: string // DeepSeek Reasoner 推理过程内容
  metadata?: any
  createdAt: Date
  isStreaming?: boolean // 前端扩展字段，标识流式消息
  isReasoningStreaming?: boolean // 前端扩展字段，推理过程是否在流式传输
}

/**
 * API 消息格式（用于与 LLM Provider 通信）
 * 这是简化版本，只包含 API 需要的字段
 */
export interface APIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  reasoning_content?: string // DeepSeek Reasoner 特有字段
}

/**
 * 流式响应片段
 */
export interface StreamChunk {
  content: string
  reasoningContent?: string // DeepSeek Reasoner 推理过程内容
  done: boolean
  reasoningDone?: boolean // 推理过程是否完成
  metadata?: {
    model?: string
    finishReason?: string
    usage?: {
      promptTokens?: number
      completionTokens?: number
      totalTokens?: number
    }
  }
}
