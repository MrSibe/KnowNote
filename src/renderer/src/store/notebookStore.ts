import { create } from 'zustand'
import type { Notebook } from '../types/notebook'

interface NotebookStore {
  notebooks: Notebook[]
  currentNotebook: Notebook | null
  openedNotebooks: Notebook[]

  addNotebook: (notebook: Omit<Notebook, 'id' | 'createdAt' | 'updatedAt'>) => string
  deleteNotebook: (id: string) => void
  updateNotebook: (id: string, updates: Partial<Notebook>) => void
  setCurrentNotebook: (id: string) => void
  addOpenedNotebook: (id: string) => void
  removeOpenedNotebook: (id: string) => void
}

export const useNotebookStore = create<NotebookStore>()((set) => ({
  notebooks: [
    // 初始化模拟数据
    {
      id: '1',
      title: '机器学习笔记',
      description: '深度学习和神经网络相关内容',
      coverColor: '#3b82f6',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-12-10'),
      chatCount: 24
    },
    {
      id: '2',
      title: 'React 项目总结',
      description: 'React 18 新特性和最佳实践',
      coverColor: '#8b5cf6',
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-12-09'),
      chatCount: 15
    },
    {
      id: '3',
      title: '论文阅读笔记',
      description: 'AI 领域最新论文解读',
      coverColor: '#ec4899',
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-12-08'),
      chatCount: 8
    }
  ],
  currentNotebook: null,
  openedNotebooks: [],

  addNotebook: (notebook) => {
    const newId = Date.now().toString()
    set((state) => ({
      notebooks: [
        {
          ...notebook,
          id: newId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        ...state.notebooks
      ]
    }))
    return newId
  },

  deleteNotebook: (id) =>
    set((state) => ({
      notebooks: state.notebooks.filter((nb) => nb.id !== id)
    })),

  updateNotebook: (id, updates) =>
    set((state) => ({
      notebooks: state.notebooks.map((nb) =>
        nb.id === id ? { ...nb, ...updates, updatedAt: new Date() } : nb
      )
    })),

  setCurrentNotebook: (id) =>
    set((state) => ({
      currentNotebook: state.notebooks.find((nb) => nb.id === id) || null
    })),

  addOpenedNotebook: (id) =>
    set((state) => {
      const notebook = state.notebooks.find((nb) => nb.id === id)
      if (!notebook) return state
      // 如果已经打开，不重复添加
      if (state.openedNotebooks.some((nb) => nb.id === id)) return state
      return {
        openedNotebooks: [...state.openedNotebooks, notebook]
      }
    }),

  removeOpenedNotebook: (id) =>
    set((state) => ({
      openedNotebooks: state.openedNotebooks.filter((nb) => nb.id !== id)
    }))
}))
