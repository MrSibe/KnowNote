/**
 * VectorStoreManager
 * 管理不同 notebook 的 VectorStore 实例
 */

import type { VectorStore, VectorStoreType } from './types'
import { SQLiteVectorStore } from './SQLiteVectorStore'
import Logger from '../../shared/utils/logger'

/**
 * 向量存储管理器
 * 为每个 notebook 维护独立的 VectorStore 实例
 */
export class VectorStoreManager {
  private stores: Map<string, VectorStore> = new Map()
  private defaultType: VectorStoreType = 'sqlite'
  private defaultDimensions: number = 1024

  /**
   * 获取或创建 notebook 的 VectorStore
   * @param notebookId 笔记本 ID
   * @param type 存储类型（可选，默认 sqlite）
   * @param dimensions 向量维度（可选，如果提供则覆盖默认值）
   */
  async getStore(
    notebookId: string,
    type?: VectorStoreType,
    dimensions?: number
  ): Promise<VectorStore> {
    const storeType = type || this.defaultType
    const key = `${notebookId}_${storeType}`
    const targetDimensions = dimensions || this.defaultDimensions

    // 检查是否已存在且维度匹配
    const existingStore = this.stores.get(key)
    if (existingStore) {
      const existingDimensions = existingStore.getDimensions()
      if (existingDimensions === targetDimensions) {
        return existingStore
      } else {
        // 维度不匹配，需要重新创建
        Logger.warn(
          'VectorStoreManager',
          `Dimension mismatch for ${key}: existing=${existingDimensions}, new=${targetDimensions}. Recreating store.`
        )
        await existingStore.close()
        this.stores.delete(key)
      }
    }

    // 创建新的 VectorStore
    const store = this.createStore(storeType)
    await store.initialize({
      notebookId,
      dimensions: targetDimensions
    })

    this.stores.set(key, store)
    Logger.info(
      'VectorStoreManager',
      `Created ${storeType} store for notebook: ${notebookId} with dimensions: ${targetDimensions}`
    )

    return store
  }

  /**
   * 创建 VectorStore 实例
   */
  private createStore(type: VectorStoreType): VectorStore {
    switch (type) {
      case 'sqlite':
        return new SQLiteVectorStore()
      case 'lancedb':
        // TODO: 实现 LanceDBVectorStore
        throw new Error('LanceDB vector store not implemented yet')
      case 'qdrant':
        // TODO: 实现 QdrantVectorStore
        throw new Error('Qdrant vector store not implemented yet')
      default:
        throw new Error(`Unknown vector store type: ${type}`)
    }
  }

  /**
   * 关闭指定 notebook 的存储
   */
  async closeStore(notebookId: string): Promise<void> {
    const keysToDelete: string[] = []

    for (const [key, store] of this.stores) {
      if (key.startsWith(notebookId)) {
        await store.close()
        keysToDelete.push(key)
        Logger.debug('VectorStoreManager', `Closed store: ${key}`)
      }
    }

    keysToDelete.forEach((key) => this.stores.delete(key))
  }

  /**
   * 关闭所有存储
   */
  async closeAll(): Promise<void> {
    for (const [key, store] of this.stores) {
      await store.close()
      Logger.debug('VectorStoreManager', `Closed store: ${key}`)
    }
    this.stores.clear()
    Logger.info('VectorStoreManager', 'All stores closed')
  }

  /**
   * 设置默认向量维度
   */
  setDefaultDimensions(dimensions: number): void {
    this.defaultDimensions = dimensions
  }

  /**
   * 获取默认向量维度
   */
  getDefaultDimensions(): number {
    return this.defaultDimensions
  }

  /**
   * 设置默认存储类型
   */
  setDefaultType(type: VectorStoreType): void {
    this.defaultType = type
  }

  /**
   * 获取已打开的存储数量
   */
  getStoreCount(): number {
    return this.stores.size
  }
}

// 导出单例实例
export const vectorStoreManager = new VectorStoreManager()
