/**
 * ChunkingService
 * 智能文档分块服务，保持语义完整性
 */

import Logger from '../../shared/utils/logger'

/**
 * 分块选项
 */
export interface ChunkOptions {
  chunkSize?: number // 每块的目标字符数，默认 500
  chunkOverlap?: number // 块之间的重叠字符数，默认 50
  separators?: string[] // 分隔符优先级列表
  minChunkSize?: number // 最小块大小，默认 100
}

/**
 * 分块结果
 */
export interface ChunkResult {
  content: string // 块内容
  index: number // 块索引
  startOffset: number // 原文起始位置
  endOffset: number // 原文结束位置
  tokenCount: number // 估算 token 数
}

/**
 * 文档分块服务
 * 支持智能分块，保持语义完整性
 */
export class ChunkingService {
  private defaultOptions: Required<ChunkOptions> = {
    chunkSize: 500,
    chunkOverlap: 50,
    minChunkSize: 100,
    separators: [
      '\n\n\n', // 多个空行（章节分隔）
      '\n\n', // 段落分隔
      '\n', // 行分隔
      '。', // 中文句号
      '.', // 英文句号
      '！',
      '!',
      '？',
      '?',
      '；',
      ';',
      '，',
      ',',
      ' ' // 空格（最后手段）
    ]
  }

  /**
   * 对文本进行分块
   */
  chunk(text: string, options?: ChunkOptions): ChunkResult[] {
    const opts = { ...this.defaultOptions, ...options }
    const { chunkSize, chunkOverlap, separators, minChunkSize } = opts

    // 预处理：移除多余空白
    const cleanedText = this.preprocessText(text)

    if (!cleanedText || cleanedText.length === 0) {
      return []
    }

    // 如果文本小于最小块大小，直接返回整个文本
    if (cleanedText.length <= minChunkSize) {
      return [
        {
          content: cleanedText,
          index: 0,
          startOffset: 0,
          endOffset: cleanedText.length,
          tokenCount: this.estimateTokens(cleanedText)
        }
      ]
    }

    const chunks: ChunkResult[] = []
    let currentStart = 0

    while (currentStart < cleanedText.length) {
      let currentEnd = Math.min(currentStart + chunkSize, cleanedText.length)

      // 如果不是文本末尾，尝试在分隔符处断开
      if (currentEnd < cleanedText.length) {
        const searchEnd = currentEnd
        const searchStart = Math.max(currentStart + Math.floor(chunkSize * 0.5), currentStart)

        let bestSplitPos = -1
        let bestSeparatorPriority = separators.length

        // 在范围内查找最佳分割点
        for (let i = searchEnd; i >= searchStart; i--) {
          for (let j = 0; j < separators.length; j++) {
            const sep = separators[j]
            if (cleanedText.slice(i, i + sep.length) === sep) {
              if (j < bestSeparatorPriority) {
                bestSplitPos = i + sep.length
                bestSeparatorPriority = j
              }
              break
            }
          }
          // 找到高优先级分隔符就停止
          if (bestSeparatorPriority <= 2) break
        }

        if (bestSplitPos > currentStart) {
          currentEnd = bestSplitPos
        }
      }

      const content = cleanedText.slice(currentStart, currentEnd).trim()

      if (content.length >= minChunkSize) {
        chunks.push({
          content,
          index: chunks.length,
          startOffset: currentStart,
          endOffset: currentEnd,
          tokenCount: this.estimateTokens(content)
        })
      }

      // 计算下一块的起始位置（考虑重叠）
      currentStart = Math.max(currentEnd - chunkOverlap, currentStart + 1)
    }

    Logger.debug('ChunkingService', `Split text into ${chunks.length} chunks`)
    return chunks
  }

  /**
   * 按句子分块（更保守的分块策略）
   */
  chunkBySentence(text: string, options?: ChunkOptions): ChunkResult[] {
    const opts = { ...this.defaultOptions, ...options }

    // 分句
    const sentences = this.splitIntoSentences(text)
    const chunks: ChunkResult[] = []
    let currentChunk: string[] = []
    let currentLength = 0
    let currentStartOffset = 0

    for (const sentence of sentences) {
      const sentenceLength = sentence.length

      if (currentLength + sentenceLength > opts.chunkSize && currentChunk.length > 0) {
        // 保存当前块
        const content = currentChunk.join('')
        chunks.push({
          content,
          index: chunks.length,
          startOffset: currentStartOffset,
          endOffset: currentStartOffset + content.length,
          tokenCount: this.estimateTokens(content)
        })

        // 开始新块（可以考虑重叠）
        currentStartOffset += content.length
        currentChunk = []
        currentLength = 0
      }

      currentChunk.push(sentence)
      currentLength += sentenceLength
    }

    // 处理最后一个块
    if (currentChunk.length > 0) {
      const content = currentChunk.join('')
      chunks.push({
        content,
        index: chunks.length,
        startOffset: currentStartOffset,
        endOffset: currentStartOffset + content.length,
        tokenCount: this.estimateTokens(content)
      })
    }

    return chunks
  }

  /**
   * 预处理文本
   */
  private preprocessText(text: string): string {
    return (
      text
        // 统一换行符
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // 移除连续的多余空白行（保留最多两个换行）
        .replace(/\n{4,}/g, '\n\n\n')
        // 移除行首行尾空白
        .trim()
    )
  }

  /**
   * 分句
   */
  private splitIntoSentences(text: string): string[] {
    // 使用正则匹配句子结束符
    const sentenceEndings = /([。！？.!?]+)/g
    const parts = text.split(sentenceEndings)
    const sentences: string[] = []

    for (let i = 0; i < parts.length; i += 2) {
      const sentence = parts[i] + (parts[i + 1] || '')
      if (sentence.trim()) {
        sentences.push(sentence)
      }
    }

    return sentences
  }

  /**
   * 估算 token 数量
   * 基于中英文混合文本的经验公式
   */
  estimateTokens(text: string): number {
    if (!text || text.length === 0) return 0

    let chineseChars = 0
    let otherChars = 0

    for (const char of text) {
      const code = char.charCodeAt(0)
      // CJK 统一表意文字及扩展
      if (
        (code >= 0x4e00 && code <= 0x9fff) || // CJK 基本
        (code >= 0x3400 && code <= 0x4dbf) || // CJK 扩展 A
        (code >= 0xf900 && code <= 0xfaff) || // CJK 兼容
        (code >= 0x3040 && code <= 0x309f) || // 平假名
        (code >= 0x30a0 && code <= 0x30ff) || // 片假名
        (code >= 0xac00 && code <= 0xd7af) // 韩文
      ) {
        chineseChars++
      } else {
        otherChars++
      }
    }

    // 中文约 1.5 字符/token，英文约 4 字符/token
    return Math.ceil(chineseChars / 1.5 + otherChars / 4)
  }

  /**
   * 更新默认选项
   */
  setDefaultOptions(options: Partial<ChunkOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options }
  }
}
