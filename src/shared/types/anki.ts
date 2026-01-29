/**
 * Anki相关类型定义
 * Anki卡片生成功能的共享类型
 */

/**
 * 基础卡片类型
 */
export interface BaseAnkiCard {
  id: string
  type: 'basic' | 'cloze' | 'fill-blank'
  tags?: string[]
  metadata?: {
    chunkIds: string[]
    difficulty?: 'easy' | 'medium' | 'hard'
  }
}

/**
 * 基础问答卡片
 * 正面:问题,背面:答案
 */
export interface BasicCard extends BaseAnkiCard {
  type: 'basic'
  front: string // 正面:问题
  back: string // 背面:答案
}

/**
 * Cloze卡片(挖空题)
 * 使用{{c1::答案}}格式
 */
export interface ClozeCard extends BaseAnkiCard {
  type: 'cloze'
  text: string // 带有{{c1::答案}}格式的文本
  backExtra?: string // 背面额外信息
}

/**
 * 填空题卡片
 */
export interface FillBlankCard extends BaseAnkiCard {
  type: 'fill-blank'
  sentence: string // 带有_____的句子
  answer: string // 填空答案
  hint?: string // 可选提示
}

/**
 * 卡片联合类型
 */
export type AnkiCardItem = BasicCard | ClozeCard | FillBlankCard

/**
 * Anki卡片集
 */
export interface AnkiCard {
  id: string
  notebookId: string
  title: string
  version: number
  cardsData: AnkiCardItem[]
  chunkMapping: Record<string, string[]> // cardId -> chunkIds
  metadata: {
    model: string
    totalCards: number
    cardTypes: string[]
    generationTime: number
  }
  status: 'generating' | 'completed' | 'failed'
  errorMessage?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Anki生成结果(用于LLM streamObject返回)
 */
export interface AnkiGenerationResult {
  cards: AnkiCardItem[]
  metadata: {
    totalCards: number
    cardTypes: string[]
  }
}

/**
 * Anki生成选项
 */
export interface AnkiGenerationOptions {
  cardCount?: number // 卡片数量,默认20
  cardTypes?: ('basic' | 'cloze' | 'fill-blank')[] // 卡片类型,默认全部
  difficulty?: 'easy' | 'medium' | 'hard'
  customPrompt?: string
}

/**
 * Anki导出格式
 */
export type AnkiExportFormat = 'apkg'
