import { create } from 'zustand'
import type { Note } from '../../../shared/types'
import type { MindMap } from '../../../main/db/schema'

/**
 * Item 类型
 */
export type ItemType = 'note' | 'mindmap' | 'ppt' | 'audio' | 'video'

/**
 * Item 详情
 */
export interface ItemDetail {
  id: string
  notebookId: string
  type: ItemType
  resourceId: string
  order: number
  createdAt: Date
  updatedAt: Date
  resource: Note | MindMap | any // 实际的资源数据
}

interface ItemStore {
  // 状态
  items: ItemDetail[]
  currentNote: Note | null
  isEditing: boolean
  isSaving: boolean

  // Actions
  setItems: (items: ItemDetail[]) => void
  setCurrentNote: (note: Note | null) => void
  setIsEditing: (isEditing: boolean) => void

  // 异步操作
  loadItems: (notebookId: string) => Promise<void>
  createNote: (notebookId: string, content: string, customTitle?: string) => Promise<Note>
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => Promise<void>
  deleteItem: (itemId: string, deleteResource: boolean) => Promise<void>
}

export const useItemStore = create<ItemStore>()((set, get) => ({
  items: [],
  currentNote: null,
  isEditing: false,
  isSaving: false,

  setItems: (items) => set({ items }),
  setCurrentNote: (note) => set({ currentNote: note, isEditing: !!note }),
  setIsEditing: (isEditing) => set({ isEditing }),

  loadItems: async (notebookId: string) => {
    console.log('[ItemStore] Loading items for notebook:', notebookId)
    try {
      const items = await window.api.items.getAll(notebookId)
      console.log(`[ItemStore] Loaded ${items.length} items`)
      set({ items })
    } catch (error) {
      console.error('[ItemStore] Failed to load items:', error)
      throw error
    }
  },

  createNote: async (notebookId: string, content: string, customTitle?: string) => {
    console.log('[ItemStore] Creating note')
    try {
      set({ isSaving: true })
      const note = await window.api.createNote(notebookId, content, customTitle)
      console.log('[ItemStore] Note created:', note.id)

      // 重新加载 items 列表
      await get().loadItems(notebookId)

      set({
        currentNote: note,
        isEditing: true,
        isSaving: false
      })

      return note
    } catch (error) {
      console.error('[ItemStore] Failed to create note:', error)
      set({ isSaving: false })
      throw error
    }
  },

  updateNote: async (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => {
    console.log('[ItemStore] Updating note:', id)
    try {
      set({ isSaving: true })
      await window.api.updateNote(id, updates)
      console.log('[ItemStore] Note updated:', id)

      set((state) => {
        const updatedItems = state.items.map((item) => {
          if (item.type === 'note' && item.resourceId === id) {
            return {
              ...item,
              resource: { ...item.resource, ...updates, updatedAt: new Date() },
              updatedAt: new Date()
            }
          }
          return item
        })

        const updatedCurrentNote =
          state.currentNote?.id === id
            ? { ...state.currentNote, ...updates, updatedAt: new Date() }
            : state.currentNote

        return {
          items: updatedItems,
          currentNote: updatedCurrentNote,
          isSaving: false
        }
      })
    } catch (error) {
      console.error('[ItemStore] Failed to update note:', error)
      set({ isSaving: false })
      throw error
    }
  },

  deleteItem: async (itemId: string, deleteResource = true) => {
    console.log('[ItemStore] Deleting item:', itemId)
    try {
      await window.api.items.delete(itemId, deleteResource)
      console.log('[ItemStore] Item deleted:', itemId)

      set((state) => {
        const deletedItem = state.items.find((item) => item.id === itemId)
        const isCurrentNote =
          deletedItem?.type === 'note' && state.currentNote?.id === deletedItem.resourceId

        return {
          items: state.items.filter((item) => item.id !== itemId),
          currentNote: isCurrentNote ? null : state.currentNote,
          isEditing: isCurrentNote ? false : state.isEditing
        }
      })
    } catch (error) {
      console.error('[ItemStore] Failed to delete item:', error)
      throw error
    }
  }
}))
