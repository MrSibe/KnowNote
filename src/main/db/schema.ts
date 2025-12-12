import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

/**
 * 聊天会话表
 * 用于存储每个笔记本下的聊天会话
 */
export const chatSessions = sqliteTable(
  'chat_sessions',
  {
    id: text('id').primaryKey(),
    notebookId: text('notebook_id').notNull(),
    title: text('title').notNull(),
    // 自动切换 session 相关字段
    summary: text('summary'), // 之前会话的摘要（如果是自动切换生成的）
    totalTokens: integer('total_tokens').notNull().default(0), // 当前会话累计 token 数
    status: text('status', { enum: ['active', 'archived'] })
      .notNull()
      .default('active'), // 会话状态
    parentSessionId: text('parent_session_id'), // 指向上一个被切换的 session
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
  },
  (table) => ({
    // 优化按笔记本查询会话的性能
    notebookIdx: index('idx_sessions_notebook').on(table.notebookId, table.updatedAt)
  })
)

/**
 * 聊天消息表
 * 存储每个会话中的所有消息（用户消息和AI回复）
 */
export const chatMessages = sqliteTable(
  'chat_messages',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => chatSessions.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
    content: text('content').notNull(),
    metadata: text('metadata', { mode: 'json' }).$type<Record<string, any>>(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
  },
  (table) => ({
    // 优化按会话查询消息的性能
    sessionIdx: index('idx_messages_session').on(table.sessionId, table.createdAt)
  })
)

/**
 * TypeScript 类型导出（从 Drizzle Schema 推导）
 */
export type ChatSession = typeof chatSessions.$inferSelect
export type NewChatSession = typeof chatSessions.$inferInsert

export type ChatMessage = typeof chatMessages.$inferSelect
export type NewChatMessage = typeof chatMessages.$inferInsert
