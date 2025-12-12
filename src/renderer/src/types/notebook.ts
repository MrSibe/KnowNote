/**
 * Notebook 相关类型定义
 */

// 从shared导入统一的聊天类型
export type { ChatSession, ChatMessage } from '../../../shared/types/chat'

export interface Notebook {
  id: string
  title: string
  description?: string | null
  createdAt: Date
  updatedAt: Date
}
