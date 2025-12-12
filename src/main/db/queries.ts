import { eq, desc, and } from 'drizzle-orm'
import { getDatabase } from './index'
import { chatSessions, chatMessages } from './schema'

// ==================== Chat Sessions ====================

/**
 * 创建新的聊天会话
 */
export function createSession(notebookId: string, title: string, parentSessionId?: string) {
  const db = getDatabase()
  const id = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const now = new Date()

  const session = db
    .insert(chatSessions)
    .values({
      id,
      notebookId,
      title,
      parentSessionId,
      createdAt: now,
      updatedAt: now
    })
    .returning()
    .get()

  return session
}

/**
 * 获取指定笔记本的活跃会话（栈顶）
 * 每个笔记本只有一个 active session
 */
export function getActiveSessionByNotebook(notebookId: string) {
  const db = getDatabase()

  return db
    .select()
    .from(chatSessions)
    .where(and(eq(chatSessions.notebookId, notebookId), eq(chatSessions.status, 'active')))
    .get()
}

/**
 * 获取指定笔记本的所有会话
 * 按更新时间倒序排列
 */
export function getSessionsByNotebook(notebookId: string) {
  const db = getDatabase()

  return db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.notebookId, notebookId))
    .orderBy(desc(chatSessions.updatedAt))
    .all()
}

/**
 * 更新会话标题
 */
export function updateSessionTitle(sessionId: string, title: string) {
  const db = getDatabase()

  db.update(chatSessions)
    .set({
      title,
      updatedAt: new Date()
    })
    .where(eq(chatSessions.id, sessionId))
    .run()
}

/**
 * 删除会话
 * 外键级联会自动删除该会话的所有消息
 */
export function deleteSession(sessionId: string) {
  const db = getDatabase()

  db.delete(chatSessions).where(eq(chatSessions.id, sessionId)).run()
}

/**
 * 获取单个会话信息
 */
export function getSessionById(sessionId: string) {
  const db = getDatabase()

  return db.select().from(chatSessions).where(eq(chatSessions.id, sessionId)).get()
}

/**
 * 更新会话的 token 计数
 */
export function updateSessionTokens(sessionId: string, tokensToAdd: number) {
  const db = getDatabase()

  // 获取当前 token 数
  const session = getSessionById(sessionId)
  if (!session) return

  const newTotal = (session.totalTokens || 0) + tokensToAdd

  db.update(chatSessions)
    .set({
      totalTokens: newTotal,
      updatedAt: new Date()
    })
    .where(eq(chatSessions.id, sessionId))
    .run()

  return newTotal
}

/**
 * 更新会话的摘要和状态
 */
export function updateSessionSummary(
  sessionId: string,
  summary: string,
  status: 'active' | 'archived' = 'archived'
) {
  const db = getDatabase()

  db.update(chatSessions)
    .set({
      summary,
      status,
      updatedAt: new Date()
    })
    .where(eq(chatSessions.id, sessionId))
    .run()
}

// ==================== Chat Messages ====================

/**
 * 创建新消息
 */
export function createMessage(
  sessionId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: Record<string, any>
) {
  const db = getDatabase()
  const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const now = new Date()

  const message = db
    .insert(chatMessages)
    .values({
      id,
      sessionId,
      role,
      content,
      metadata,
      createdAt: now
    })
    .returning()
    .get()

  // 更新会话的 updatedAt
  db.update(chatSessions).set({ updatedAt: now }).where(eq(chatSessions.id, sessionId)).run()

  return message
}

/**
 * 获取指定会话的所有消息
 * 按创建时间顺序排列
 */
export function getMessagesBySession(sessionId: string) {
  const db = getDatabase()

  return db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).all()
}

/**
 * 更新消息内容
 * 主要用于更新流式消息的完整内容
 */
export function updateMessageContent(messageId: string, content: string) {
  const db = getDatabase()

  db.update(chatMessages).set({ content }).where(eq(chatMessages.id, messageId)).run()
}
