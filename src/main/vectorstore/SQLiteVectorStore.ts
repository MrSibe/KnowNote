/**
 * SQLiteVectorStore
 * 基于 sqlite-vec 扩展的向量存储实现
 */

import { getSqlite } from '../db'
import type { VectorStore, VectorItem, QueryResult, QueryOptions, VectorStoreConfig } from './types'
import Logger from '../../shared/utils/logger'

/**
 * SQLite 向量存储实现
 * 使用 sqlite-vec 的 vec0 虚拟表进行高性能向量检索
 */
export class SQLiteVectorStore implements VectorStore {
  private notebookId: string = ''
  private dimensions: number = 1024
  private initialized: boolean = false

  async initialize(config: VectorStoreConfig): Promise<void> {
    this.notebookId = config.notebookId
    this.dimensions = config.dimensions || 1024
    this.initialized = true
    Logger.info('SQLiteVectorStore', `Initialized for notebook: ${this.notebookId}`)
  }

  async upsert(items: VectorItem[]): Promise<void> {
    if (!this.initialized) {
      throw new Error('VectorStore not initialized')
    }

    const sqlite = getSqlite()
    if (!sqlite) {
      throw new Error('SQLite instance not available')
    }

    const insertStmt = sqlite.prepare(`
      INSERT OR REPLACE INTO vec_embeddings (embedding_id, chunk_id, notebook_id, embedding)
      VALUES (?, ?, ?, ?)
    `)

    const insertMany = sqlite.transaction((items: VectorItem[]) => {
      for (const item of items) {
        // 验证向量维度
        if (item.vector.length !== this.dimensions) {
          Logger.warn(
            'SQLiteVectorStore',
            `Vector dimension mismatch: expected ${this.dimensions}, got ${item.vector.length}`
          )
        }

        // sqlite-vec 可以直接接受 Float32Array
        insertStmt.run(item.id, item.chunkId, this.notebookId, item.vector)
      }
    })

    try {
      insertMany(items)
      Logger.debug('SQLiteVectorStore', `Upserted ${items.length} vectors`)
    } catch (error) {
      Logger.error('SQLiteVectorStore', 'Failed to upsert vectors:', error)
      throw error
    }
  }

  async delete(ids: string[]): Promise<void> {
    if (!this.initialized) {
      throw new Error('VectorStore not initialized')
    }

    if (ids.length === 0) return

    const sqlite = getSqlite()
    if (!sqlite) {
      throw new Error('SQLite instance not available')
    }

    const placeholders = ids.map(() => '?').join(',')
    const deleteStmt = sqlite.prepare(`
      DELETE FROM vec_embeddings WHERE embedding_id IN (${placeholders})
    `)

    try {
      deleteStmt.run(...ids)
      Logger.debug('SQLiteVectorStore', `Deleted ${ids.length} vectors`)
    } catch (error) {
      Logger.error('SQLiteVectorStore', 'Failed to delete vectors:', error)
      throw error
    }
  }

  async deleteByChunkIds(chunkIds: string[]): Promise<void> {
    if (!this.initialized) {
      throw new Error('VectorStore not initialized')
    }

    if (chunkIds.length === 0) return

    const sqlite = getSqlite()
    if (!sqlite) {
      throw new Error('SQLite instance not available')
    }

    const placeholders = chunkIds.map(() => '?').join(',')
    const deleteStmt = sqlite.prepare(`
      DELETE FROM vec_embeddings WHERE chunk_id IN (${placeholders})
    `)

    try {
      deleteStmt.run(...chunkIds)
      Logger.debug('SQLiteVectorStore', `Deleted vectors for ${chunkIds.length} chunks`)
    } catch (error) {
      Logger.error('SQLiteVectorStore', 'Failed to delete vectors by chunk IDs:', error)
      throw error
    }
  }

  async query(queryVector: Float32Array, options: QueryOptions = {}): Promise<QueryResult[]> {
    if (!this.initialized) {
      throw new Error('VectorStore not initialized')
    }

    const { topK = 5, threshold } = options

    const sqlite = getSqlite()
    if (!sqlite) {
      throw new Error('SQLite instance not available')
    }

    try {
      // 使用 sqlite-vec 的 KNN 查询
      // cosine 距离：0 表示完全相同，2 表示完全相反
      // 转换为相似度分数：1 - (distance / 2)
      const queryStmt = sqlite.prepare(`
        SELECT
          embedding_id,
          chunk_id,
          distance
        FROM vec_embeddings
        WHERE embedding MATCH ?
          AND k = ?
          AND notebook_id = ?
        ORDER BY distance ASC
      `)

      // sqlite-vec 可以直接接受 Float32Array
      const results = queryStmt.all(queryVector, topK, this.notebookId) as Array<{
        embedding_id: string
        chunk_id: string
        distance: number
      }>

      // 转换结果
      const queryResults: QueryResult[] = results.map((row) => {
        // cosine 距离转相似度（0-1）
        const score = 1 - row.distance / 2

        return {
          id: row.embedding_id,
          chunkId: row.chunk_id,
          score,
          distance: row.distance
        }
      })

      // 应用阈值过滤
      const filteredResults = threshold
        ? queryResults.filter((r) => r.score >= threshold)
        : queryResults

      Logger.debug(
        'SQLiteVectorStore',
        `Query returned ${filteredResults.length} results (threshold: ${threshold})`
      )

      return filteredResults
    } catch (error) {
      Logger.error('SQLiteVectorStore', 'Failed to query vectors:', error)
      throw error
    }
  }

  async clear(): Promise<void> {
    if (!this.initialized) {
      throw new Error('VectorStore not initialized')
    }

    const sqlite = getSqlite()
    if (!sqlite) {
      throw new Error('SQLite instance not available')
    }

    try {
      const deleteStmt = sqlite.prepare(`
        DELETE FROM vec_embeddings WHERE notebook_id = ?
      `)
      deleteStmt.run(this.notebookId)

      Logger.info('SQLiteVectorStore', `Cleared all vectors for notebook: ${this.notebookId}`)
    } catch (error) {
      Logger.error('SQLiteVectorStore', 'Failed to clear vectors:', error)
      throw error
    }
  }

  async count(): Promise<number> {
    if (!this.initialized) {
      throw new Error('VectorStore not initialized')
    }

    const sqlite = getSqlite()
    if (!sqlite) {
      throw new Error('SQLite instance not available')
    }

    try {
      const countStmt = sqlite.prepare(`
        SELECT COUNT(*) as count FROM vec_embeddings WHERE notebook_id = ?
      `)
      const result = countStmt.get(this.notebookId) as { count: number }

      return result?.count || 0
    } catch (error) {
      Logger.error('SQLiteVectorStore', 'Failed to count vectors:', error)
      throw error
    }
  }

  async close(): Promise<void> {
    this.initialized = false
    Logger.info('SQLiteVectorStore', `Closed for notebook: ${this.notebookId}`)
  }

  getNotebookId(): string {
    return this.notebookId
  }

  getDimensions(): number {
    return this.dimensions
  }
}
