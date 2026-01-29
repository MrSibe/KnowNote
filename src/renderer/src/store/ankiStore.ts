import { create } from 'zustand'
import type { AnkiCard } from '../../../main/db/schema'
import type { AnkiCardItem } from '../../../shared/types/anki'

interface AnkiStore {
  // 核心状态
  currentAnkiCards: AnkiCard | null
  selectedCardIds: Set<string>
  isGenerating: boolean
  generationProgress: { stage: string; progress: number } | null

  // Dialog状态
  isConfigDialogOpen: boolean
  isExportDialogOpen: boolean

  // 卡片编辑状态
  editingCard: AnkiCardItem | null
  isEditing: boolean

  // Actions
  setCurrentAnkiCards: (cards: AnkiCard | null) => void
  setSelectedCardIds: (ids: Set<string>) => void
  toggleCardSelection: (id: string) => void
  clearSelection: () => void
  setIsGenerating: (isGenerating: boolean) => void
  setGenerationProgress: (progress: { stage: string; progress: number } | null) => void
  setConfigDialogOpen: (open: boolean) => void
  setExportDialogOpen: (open: boolean) => void
  setEditingCard: (card: AnkiCardItem | null) => void
  setIsEditing: (isEditing: boolean) => void

  // 计算属性
  getTotalCards: () => number
  getSelectedCards: () => AnkiCardItem[]

  // 异步操作
  loadLatestAnkiCards: (notebookId: string) => Promise<void>
  loadAnkiCards: (ankiCardId: string) => Promise<void>
  generateAnkiCards: (
    notebookId: string,
    options?: {
      cardCount?: number
      cardTypes?: ('basic' | 'cloze' | 'fill-blank')[]
      difficulty?: 'easy' | 'medium' | 'hard'
      customPrompt?: string
    }
  ) => Promise<void>
  exportCards: (
    format: 'apkg',
    deckName?: string
  ) => Promise<{ success: boolean; filePath?: string; error?: string }>
  updateCard: (cardId: string, updates: Partial<AnkiCardItem>) => void
  deleteCards: (cardIds: string[]) => Promise<void>
  reset: () => void
}

export const useAnkiStore = create<AnkiStore>()((set, get) => ({
  // 初始状态
  currentAnkiCards: null,
  selectedCardIds: new Set(),
  isGenerating: false,
  generationProgress: null,
  isConfigDialogOpen: false,
  isExportDialogOpen: false,
  editingCard: null,
  isEditing: false,

  // Setters
  setCurrentAnkiCards: (cards) => set({ currentAnkiCards: cards }),
  setSelectedCardIds: (ids) => set({ selectedCardIds: ids }),
  toggleCardSelection: (id) =>
    set((state) => {
      const newIds = new Set(state.selectedCardIds)
      if (newIds.has(id)) {
        newIds.delete(id)
      } else {
        newIds.add(id)
      }
      return { selectedCardIds: newIds }
    }),
  clearSelection: () => set({ selectedCardIds: new Set() }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setGenerationProgress: (progress) => set({ generationProgress: progress }),
  setConfigDialogOpen: (open) => set({ isConfigDialogOpen: open }),
  setExportDialogOpen: (open) => set({ isExportDialogOpen: open }),
  setEditingCard: (card) => set({ editingCard: card }),
  setIsEditing: (isEditing) => set({ isEditing }),

  // 计算属性
  getTotalCards: () => {
    const { currentAnkiCards } = get()
    if (!currentAnkiCards) return 0
    return currentAnkiCards.cardsData.length
  },

  getSelectedCards: () => {
    const { currentAnkiCards, selectedCardIds } = get()
    if (!currentAnkiCards) return []
    const cards = currentAnkiCards.cardsData as AnkiCardItem[]
    return cards.filter((card) => selectedCardIds.has(card.id))
  },

  // 异步操作
  loadLatestAnkiCards: async (notebookId: string) => {
    try {
      const cards = await window.api.anki.getLatest(notebookId)
      set({ currentAnkiCards: cards })
    } catch (error) {
      console.error('Failed to load latest anki cards:', error)
      throw error
    }
  },

  loadAnkiCards: async (ankiCardId: string) => {
    try {
      const cards = await window.api.anki.get(ankiCardId)
      set({ currentAnkiCards: cards })
    } catch (error) {
      console.error('Failed to load anki cards:', error)
      throw error
    }
  },

  generateAnkiCards: async (
    notebookId: string,
    options?: {
      cardCount?: number
      cardTypes?: ('basic' | 'cloze' | 'fill-blank')[]
      difficulty?: 'easy' | 'medium' | 'hard'
      customPrompt?: string
    }
  ) => {
    set({ isGenerating: true, generationProgress: { stage: 'starting', progress: 0 } })
    try {
      const result = await window.api.anki.generate(notebookId, options)
      if (result.success) {
        // 生成成功，但不更新currentAnkiCards
        // 这样用户可以继续查看当前卡片，同时新卡片在后台生成
        set({
          isGenerating: false,
          generationProgress: null
        })
      } else {
        throw new Error(result.error || 'Failed to generate anki cards')
      }
    } catch (error) {
      console.error('Failed to generate anki cards:', error)
      set({ isGenerating: false, generationProgress: null })
      throw error
    }
  },

  exportCards: async (format: 'apkg', deckName?: string) => {
    const { currentAnkiCards } = get()
    if (!currentAnkiCards) {
      return { success: false, error: 'No cards to export' }
    }

    try {
      const result = await window.api.anki.export(currentAnkiCards.id, format, deckName)
      set({ isExportDialogOpen: false })
      return result
    } catch (error) {
      console.error('Failed to export cards:', error)
      return { success: false, error: (error as Error).message }
    }
  },

  updateCard: (cardId: string, updates: Partial<AnkiCardItem>) => {
    const { currentAnkiCards } = get()
    if (!currentAnkiCards) return

    const cards = currentAnkiCards.cardsData as AnkiCardItem[]
    const updatedCards = cards.map((card) => (card.id === cardId ? { ...card, ...updates } : card))

    set({
      currentAnkiCards: {
        ...currentAnkiCards,
        cardsData: updatedCards
      }
    })
  },

  deleteCards: async (cardIds: string[]) => {
    // 这里可以添加删除卡片的逻辑
    // 目前暂不支持单个卡片删除,只支持删除整个卡片集
    console.log('Delete cards:', cardIds)
  },

  reset: () => {
    set({
      selectedCardIds: new Set(),
      isGenerating: false,
      generationProgress: null,
      isConfigDialogOpen: false,
      isExportDialogOpen: false,
      editingCard: null,
      isEditing: false
    })
  }
}))

// 设置进度监听器
export function setupAnkiListeners() {
  return window.api.anki.onProgress((data) => {
    useAnkiStore.setState({
      generationProgress: { stage: data.stage, progress: data.progress }
    })
  })
}
