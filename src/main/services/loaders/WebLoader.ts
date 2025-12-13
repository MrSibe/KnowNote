/**
 * WebLoader
 * 使用 @mozilla/readability 智能提取网页正文
 */

import { JSDOM } from 'jsdom'
import { Readability } from '@mozilla/readability'
import * as cheerio from 'cheerio'
import TurndownService from 'turndown'
import Logger from '../../../shared/utils/logger'
import type { IDocumentLoader, DocumentLoadResult, LoadOptions, SectionInfo } from './types'

/**
 * 网页加载器
 * 基于 Mozilla Readability（Firefox Reader View）
 */
export class WebLoader implements IDocumentLoader {
  readonly supportedMimeTypes = ['text/html', 'application/xhtml+xml']
  readonly supportedExtensions = ['html', 'htm']

  private turndownService: TurndownService

  constructor() {
    // 初始化 HTML 转 Markdown 服务
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    })
  }

  canLoad(filePathOrMimeType: string): boolean {
    const lower = filePathOrMimeType.toLowerCase()
    return (
      this.supportedMimeTypes.includes(lower) ||
      this.supportedExtensions.some((ext) => lower.endsWith(`.${ext}`))
    )
  }

  async loadFromPath(): Promise<DocumentLoadResult> {
    // Web 内容通常不从文件路径加载，而是从 URL
    // 这里提供一个占位实现
    throw new Error(
      'WebLoader.loadFromPath is not supported. Use loadFromBuffer with HTML content.'
    )
  }

  async loadFromBuffer(buffer: Buffer, options?: LoadOptions): Promise<DocumentLoadResult> {
    const opts = { preserveStructure: true, ...options }
    const html = buffer.toString('utf-8')

    try {
      // 使用 Readability 智能提取正文
      const dom = new JSDOM(html, { url: 'https://example.com' })
      const reader = new Readability(dom.window.document)
      const article = reader.parse()

      if (!article) {
        // 回退：使用 cheerio 直接提取
        Logger.warn('WebLoader', 'Readability failed, falling back to cheerio')
        return this.fallbackParse(html, opts)
      }

      // 转换为 Markdown
      const markdown = this.turndownService.turndown(article.content || '')

      // 提取章节结构
      const sections = opts.preserveStructure
        ? this.extractSections(article.content || '')
        : undefined

      return {
        content: markdown.trim(),
        title: article.title || undefined,
        mimeType: 'text/html',
        structure: sections
          ? {
              type: 'sections',
              sections
            }
          : undefined,
        metadata: {
          excerpt: article.excerpt,
          byline: article.byline,
          siteName: article.siteName,
          length: article.length,
          publishedTime: article.publishedTime
        }
      }
    } catch (error) {
      Logger.error('WebLoader', 'Failed to parse web content:', error)
      throw new Error(`Failed to parse web content: ${(error as Error).message}`)
    }
  }

  /**
   * 回退解析（当 Readability 失败时）
   */
  private fallbackParse(html: string, opts: LoadOptions): DocumentLoadResult {
    const $ = cheerio.load(html)

    // 移除脚本、样式等
    $('script, style, nav, footer, aside').remove()

    // 尝试找到主内容区域
    const mainContent =
      $('article').html() ||
      $('main').html() ||
      $('.content').html() ||
      $('#content').html() ||
      $('body').html() ||
      ''

    const markdown = this.turndownService.turndown(mainContent)

    // 提取标题
    const title = $('title').text().trim() || $('h1').first().text().trim() || undefined

    // 提取章节
    const sections = opts.preserveStructure ? this.extractSections(mainContent) : undefined

    return {
      content: markdown.trim(),
      title,
      mimeType: 'text/html',
      structure: sections
        ? {
            type: 'sections',
            sections
          }
        : undefined,
      metadata: {
        fallback: true
      }
    }
  }

  /**
   * 从 HTML 中提取章节结构
   */
  private extractSections(html: string): SectionInfo[] {
    const $ = cheerio.load(html)
    const sections: SectionInfo[] = []
    const headings = $('h1, h2, h3, h4, h5, h6').toArray()

    for (const heading of headings) {
      const $heading = $(heading)
      const tagName = $heading.prop('tagName')?.toLowerCase()
      const level = tagName ? parseInt(tagName.charAt(1)) : 1
      const title = $heading.text().trim()

      if (!title) continue

      // 提取该标题后直到下一个同级或更高级标题的内容
      let contentHtml = ''
      let nextSibling = $heading.next()
      while (nextSibling.length) {
        const nextTag = nextSibling.prop('tagName')?.toLowerCase()
        if (nextTag && /^h[1-6]$/.test(nextTag)) {
          const nextLevel = parseInt(nextTag.charAt(1))
          if (nextLevel <= level) break
        }
        contentHtml += $.html(nextSibling)
        nextSibling = nextSibling.next()
      }

      const contentMarkdown = this.turndownService.turndown(contentHtml).trim()

      sections.push({
        level,
        title,
        content: contentMarkdown,
        startOffset: 0, // HTML 中难以精确定位
        endOffset: 0
      })
    }

    return this.buildHierarchy(sections)
  }

  /**
   * 构建章节层级关系
   */
  private buildHierarchy(flatSections: SectionInfo[]): SectionInfo[] {
    const root: SectionInfo[] = []
    const stack: SectionInfo[] = []

    for (const section of flatSections) {
      while (stack.length > 0 && stack[stack.length - 1].level >= section.level) {
        stack.pop()
      }

      if (stack.length === 0) {
        root.push(section)
      } else {
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
