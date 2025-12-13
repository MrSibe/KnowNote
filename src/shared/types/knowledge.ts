/**
 * 知识库相关类型定义
 */

/**
 * 文档类型
 */
export type DocumentType = 'file' | 'note' | 'url' | 'text'

/**
 * 文档状态
 */
export type DocumentStatus = 'pending' | 'processing' | 'indexed' | 'failed'

/**
 * 文档
 */
export interface KnowledgeDocument {
  id: string
  notebookId: string
  title: string
  type: DocumentType
  sourceUri?: string
  sourceNoteId?: string
  content?: string
  contentHash?: string
  mimeType?: string
  fileSize?: number
  metadata?: Record<string, unknown>
  status: DocumentStatus
  errorMessage?: string
  chunkCount: number
  createdAt: Date
  updatedAt: Date
}

/**
 * 文档分块
 */
export interface KnowledgeChunk {
  id: string
  documentId: string
  notebookId: string
  content: string
  chunkIndex: number
  startOffset?: number
  endOffset?: number
  metadata?: Record<string, unknown>
  tokenCount?: number
  createdAt: Date
}

/**
 * 搜索结果
 */
export interface KnowledgeSearchResult {
  chunkId: string
  documentId: string
  documentTitle: string
  documentType: string
  content: string
  score: number
  chunkIndex: number
  metadata?: Record<string, unknown>
}

/**
 * 索引进度
 */
export interface IndexProgress {
  notebookId?: string
  documentId?: string
  stage: string
  progress: number
}

/**
 * 知识库统计
 */
export interface KnowledgeStats {
  documentCount: number
  chunkCount: number
  embeddingCount: number
}

/**
 * 添加文档选项
 */
export interface AddDocumentOptions {
  title: string
  type: DocumentType
  content: string
  sourceUri?: string
  sourceNoteId?: string
  mimeType?: string
  fileSize?: number
  metadata?: Record<string, unknown>
}

/**
 * 搜索选项
 */
export interface SearchOptions {
  topK?: number
  threshold?: number
  includeContent?: boolean
}
