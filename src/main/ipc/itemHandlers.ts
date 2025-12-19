import { ipcMain } from 'electron'
import { itemService } from '../services/ItemService'
import Logger from '../../shared/utils/logger'
import { z } from 'zod'
import { validate } from './validation'

/**
 * Item 相关验证 Schema
 */
const ItemSchemas = {
  getItems: z.object({
    notebookId: z.string()
  }),
  updateOrder: z.object({
    itemId: z.string(),
    order: z.number()
  }),
  batchUpdateOrder: z.object({
    updates: z.record(z.string(), z.number())
  }),
  deleteItem: z.object({
    itemId: z.string(),
    deleteResource: z.boolean().optional()
  })
}

/**
 * 注册 item 相关 IPC handlers
 */
export function registerItemHandlers() {
  // 获取笔记本下的所有 items
  ipcMain.handle(
    'items:get',
    validate(ItemSchemas.getItems, async (args) => {
      Logger.debug('ItemHandlers', 'items:get:', args.notebookId)
      try {
        const items = await itemService.getItemsByNotebook(args.notebookId)
        Logger.debug('ItemHandlers', `Retrieved ${items.length} items`)
        return items
      } catch (error) {
        Logger.error('ItemHandlers', 'Error getting items:', error)
        throw error
      }
    })
  )

  // 更新 item 顺序
  ipcMain.handle(
    'items:update-order',
    validate(ItemSchemas.updateOrder, async (args) => {
      Logger.debug('ItemHandlers', 'items:update-order:', args)
      try {
        await itemService.updateItemOrder(args.itemId, args.order)
        return { success: true }
      } catch (error) {
        Logger.error('ItemHandlers', 'Error updating item order:', error)
        throw error
      }
    })
  )

  // 批量更新 items 顺序
  ipcMain.handle(
    'items:batch-update-order',
    validate(ItemSchemas.batchUpdateOrder, async (args) => {
      Logger.debug('ItemHandlers', 'items:batch-update-order:', {
        count: Object.keys(args.updates).length
      })
      try {
        await itemService.batchUpdateOrder(args.updates)
        return { success: true }
      } catch (error) {
        Logger.error('ItemHandlers', 'Error batch updating order:', error)
        throw error
      }
    })
  )

  // 删除 item（可选删除关联资源）
  ipcMain.handle(
    'items:delete',
    validate(ItemSchemas.deleteItem, async (args) => {
      Logger.debug('ItemHandlers', 'items:delete:', args)
      try {
        if (args.deleteResource) {
          await itemService.deleteItemWithResource(args.itemId)
        } else {
          await itemService.deleteItem(args.itemId)
        }
        return { success: true }
      } catch (error) {
        Logger.error('ItemHandlers', 'Error deleting item:', error)
        throw error
      }
    })
  )
}
