import { getDatabase } from '../db'
import { items, notes, mindMaps, type Item, type NewItem } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'

/**
 * Item 类型枚举
 */
export type ItemType = 'note' | 'mindmap' | 'ppt' | 'audio' | 'video'

/**
 * Item 详情（包含关联的资源数据）
 */
export interface ItemDetail extends Item {
  resource: any // 根据 type 返回对应的资源数据（Note | MindMap | ...）
}

/**
 * Item 服务
 * 统一管理笔记本下的所有内容项
 */
export class ItemService {
  /**
   * 获取笔记本下的所有 items（包含关联资源）
   * 按照 order 升序排序
   */
  async getItemsByNotebook(notebookId: string): Promise<ItemDetail[]> {
    const db = getDatabase()
    const itemsList = await db
      .select()
      .from(items)
      .where(eq(items.notebookId, notebookId))
      .orderBy(items.order)

    // 加载每个 item 的关联资源
    const itemDetails: ItemDetail[] = []
    for (const item of itemsList) {
      let resource: any = null

      switch (item.type) {
        case 'note': {
          const noteResult = await db
            .select()
            .from(notes)
            .where(eq(notes.id, item.resourceId))
            .limit(1)
          resource = noteResult[0] || null
          break
        }

        case 'mindmap': {
          const mindMapResult = await db
            .select()
            .from(mindMaps)
            .where(eq(mindMaps.id, item.resourceId))
            .limit(1)
          resource = mindMapResult[0] || null
          break
        }

        // 未来可以添加更多类型
        default:
          resource = null
      }

      if (resource) {
        itemDetails.push({
          ...item,
          resource
        })
      }
    }

    return itemDetails
  }

  /**
   * 创建 item（自动添加到列表最后）
   */
  async createItem(data: {
    notebookId: string
    type: ItemType
    resourceId: string
    order?: number
  }): Promise<Item> {
    const db = getDatabase()
    const now = new Date()

    // 如果没有指定 order，获取当前笔记本的最大 order 值
    let order = data.order
    if (order === undefined) {
      const existingItems = await db
        .select()
        .from(items)
        .where(eq(items.notebookId, data.notebookId))

      // 找到最大的 order 值，新 item 的 order 为最大值 + 1
      const maxOrder = existingItems.reduce((max, item) => Math.max(max, item.order), -1)
      order = maxOrder + 1
    }

    const newItem: NewItem = {
      id: nanoid(),
      notebookId: data.notebookId,
      type: data.type,
      resourceId: data.resourceId,
      order,
      createdAt: now,
      updatedAt: now
    }

    await db.insert(items).values(newItem)
    return newItem as Item
  }

  /**
   * 删除 item（不删除关联的资源）
   */
  async deleteItem(itemId: string): Promise<void> {
    const db = getDatabase()
    await db.delete(items).where(eq(items.id, itemId))
  }

  /**
   * 更新 item 的顺序
   */
  async updateItemOrder(itemId: string, order: number): Promise<void> {
    const db = getDatabase()
    await db.update(items).set({ order, updatedAt: new Date() }).where(eq(items.id, itemId))
  }

  /**
   * 批量更新 items 的顺序
   * @param updates - { itemId: order } 的映射
   */
  async batchUpdateOrder(updates: Record<string, number>): Promise<void> {
    const db = getDatabase()
    const now = new Date()
    for (const [itemId, order] of Object.entries(updates)) {
      await db.update(items).set({ order, updatedAt: now }).where(eq(items.id, itemId))
    }
  }

  /**
   * 根据资源 ID 和类型查找 item
   */
  async findItemByResource(resourceId: string, type: ItemType): Promise<Item | null> {
    const db = getDatabase()
    const result = await db
      .select()
      .from(items)
      .where(and(eq(items.resourceId, resourceId), eq(items.type, type)))
      .limit(1)

    return result[0] || null
  }

  /**
   * 删除关联的资源和 item
   */
  async deleteItemWithResource(itemId: string): Promise<void> {
    const db = getDatabase()
    const item = await db.select().from(items).where(eq(items.id, itemId)).limit(1)

    if (!item[0]) {
      throw new Error('Item not found')
    }

    const { type, resourceId } = item[0]

    // 删除关联的资源
    switch (type) {
      case 'note':
        await db.delete(notes).where(eq(notes.id, resourceId))
        break
      case 'mindmap':
        await db.delete(mindMaps).where(eq(mindMaps.id, resourceId))
        break
      // 未来可以添加更多类型
    }

    // 删除 item（如果资源有级联删除，可能已经被删除）
    await db.delete(items).where(eq(items.id, itemId))
  }
}

export const itemService = new ItemService()
