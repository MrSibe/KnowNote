/**
 * PptLoader
 * 使用 officeparser 解析 PPT，按页提取
 */

import { readFile } from 'fs/promises'
import { extname } from 'path'
import officeParser from 'officeparser'
import Logger from '../../../shared/utils/logger'
import type { IDocumentLoader, DocumentLoadResult, LoadOptions, PageInfo } from './types'

/**
 * PowerPoint 文档加载器
 * 基于 officeparser，支持 PPTX
 */
export class PptLoader implements IDocumentLoader {
  readonly supportedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint'
  ]
  readonly supportedExtensions = ['pptx', 'ppt']

  canLoad(filePathOrMimeType: string): boolean {
    const lower = filePathOrMimeType.toLowerCase()
    return (
      this.supportedMimeTypes.includes(lower) ||
      this.supportedExtensions.includes(extname(lower).slice(1))
    )
  }

  async loadFromPath(filePath: string, options?: LoadOptions): Promise<DocumentLoadResult> {
    const buffer = await readFile(filePath)
    return this.loadFromBuffer(buffer, options)
  }

  async loadFromBuffer(buffer: Buffer, options?: LoadOptions): Promise<DocumentLoadResult> {
    const opts = { preserveStructure: true, ...options }

    try {
      // 使用 officeparser 提取文本
      const text = await officeParser.parseOfficeAsync(buffer)
      const content = text.trim()

      // 按启发式规则分隔幻灯片
      // officeparser 不直接提供页面分隔，我们使用多个连续换行作为分隔符
      const pages: PageInfo[] = []
      let currentOffset = 0

      if (opts.preserveStructure) {
        // 按连续 3 个或更多换行分隔（通常是幻灯片之间的分隔）
        const slideTexts = content.split(/\n{3,}/)

        for (let i = 0; i < slideTexts.length; i++) {
          const slideText = slideTexts[i].trim()
          if (!slideText) continue

          const pageInfo: PageInfo = {
            pageNumber: i + 1,
            content: slideText,
            startOffset: currentOffset,
            endOffset: currentOffset + slideText.length
          }

          pages.push(pageInfo)
          currentOffset += slideText.length + 3 // +3 for separator
        }
      }

      // 提取标题（通常是第一页的第一行）
      const firstLine = content.split('\n')[0]?.trim()
      const title = firstLine && firstLine.length < 100 ? firstLine : undefined

      return {
        content,
        title,
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        structure:
          pages.length > 0
            ? {
                type: 'pages',
                pages
              }
            : undefined,
        metadata: {
          slideCount: pages.length,
          characterCount: content.length
        }
      }
    } catch (error) {
      Logger.error('PptLoader', 'Failed to parse PPT:', error)
      throw new Error(`Failed to parse PPT: ${(error as Error).message}`)
    }
  }
}
