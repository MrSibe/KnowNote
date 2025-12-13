/**
 * DocxLoader
 * 使用 mammoth 解析 Word 文档，并提取结构信息
 */

import { readFile } from 'fs/promises'
import { extname } from 'path'
import mammoth from 'mammoth'
import * as cheerio from 'cheerio'
import Logger from '../../../shared/utils/logger'
import type { IDocumentLoader, DocumentLoadResult, LoadOptions, SectionInfo } from './types'

/**
 * Word 文档加载器
 * 基于 mammoth，支持 DOCX 和 DOC
 */
export class DocxLoader implements IDocumentLoader {
  readonly supportedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ]
  readonly supportedExtensions = ['docx', 'doc']

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
      // 提取纯文本
      const textResult = await mammoth.extractRawText({ buffer })
      const content = textResult.value.trim()

      // 提取结构信息（将文档转换为 HTML，从中提取标题）
      let sections: SectionInfo[] | undefined
      let title: string | undefined

      if (opts.preserveStructure) {
        const htmlResult = await mammoth.convertToHtml({ buffer })
        const $ = cheerio.load(htmlResult.value)

        // 提取第一个标题作为文档标题
        const firstH1 = $('h1').first().text().trim()
        title = firstH1 || undefined

        // 提取章节结构
        sections = this.extractSectionsFromHtml($, content)
      }

      return {
        content,
        title,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        structure: sections
          ? {
              type: 'sections',
              sections
            }
          : undefined,
        metadata: {
          warnings: textResult.messages,
          characterCount: content.length,
          wordCount: content.split(/\s+/).length
        }
      }
    } catch (error) {
      Logger.error('DocxLoader', 'Failed to parse Word document:', error)
      throw new Error(`Failed to parse Word document: ${(error as Error).message}`)
    }
  }

  /**
   * 从 HTML 中提取章节结构
   */
  private extractSectionsFromHtml($: cheerio.CheerioAPI, fullContent: string): SectionInfo[] {
    const sections: SectionInfo[] = []
    const headings = $('h1, h2, h3, h4, h5, h6').toArray()

    for (let i = 0; i < headings.length; i++) {
      const heading = $(headings[i])
      const tagName = heading.prop('tagName')?.toLowerCase()
      const level = tagName ? parseInt(tagName.charAt(1)) : 1
      const title = heading.text().trim()

      if (!title) continue

      // 尝试在全文中定位这个标题
      const startOffset = fullContent.indexOf(title)
      if (startOffset === -1) continue

      // 计算到下一个同级或更高级标题的内容
      let endOffset = fullContent.length
      for (let j = i + 1; j < headings.length; j++) {
        const nextHeading = $(headings[j])
        const nextTagName = nextHeading.prop('tagName')?.toLowerCase()
        const nextLevel = nextTagName ? parseInt(nextTagName.charAt(1)) : 1

        if (nextLevel <= level) {
          const nextTitle = nextHeading.text().trim()
          const nextStart = fullContent.indexOf(nextTitle, startOffset + title.length)
          if (nextStart !== -1) {
            endOffset = nextStart
            break
          }
        }
      }

      const sectionContent = fullContent.substring(startOffset, endOffset).trim()

      sections.push({
        level,
        title,
        content: sectionContent,
        startOffset,
        endOffset
      })
    }

    // 构建层级关系
    return this.buildHierarchy(sections)
  }

  /**
   * 构建章节层级关系
   */
  private buildHierarchy(flatSections: SectionInfo[]): SectionInfo[] {
    const root: SectionInfo[] = []
    const stack: SectionInfo[] = []

    for (const section of flatSections) {
      // 弹出比当前章节级别高的节点
      while (stack.length > 0 && stack[stack.length - 1].level >= section.level) {
        stack.pop()
      }

      if (stack.length === 0) {
        // 顶级章节
        root.push(section)
      } else {
        // 子章节
        const parent = stack[stack.length - 1]
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(section)
      }

      stack.push(section)
    }

    return root
  }
}
