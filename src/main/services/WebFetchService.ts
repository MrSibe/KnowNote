/**
 * WebFetchService
 * 网页抓取服务，支持提取正文和转换为 Markdown
 */

import * as cheerio from 'cheerio'
import TurndownService from 'turndown'
import Logger from '../../shared/utils/logger'

/**
 * 抓取结果
 */
export interface FetchResult {
  content: string // 提取的文本内容
  title?: string // 页面标题
  description?: string // 页面描述
  url: string // 原始 URL
  mimeType: string
  metadata?: Record<string, unknown>
}

/**
 * 抓取选项
 */
export interface FetchOptions {
  timeout?: number // 超时时间（毫秒），默认 30000
  extractMainContent?: boolean // 是否提取主要内容，默认 true
  convertToMarkdown?: boolean // 是否转换为 Markdown，默认 true
  userAgent?: string // 自定义 User-Agent
}

/**
 * 网页抓取服务
 */
export class WebFetchService {
  private turndown: TurndownService
  private defaultOptions: Required<FetchOptions> = {
    timeout: 30000,
    extractMainContent: true,
    convertToMarkdown: true,
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }

  constructor() {
    // 配置 Turndown
    this.turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-'
    })

    // 移除不需要的元素
    this.turndown.remove(['script', 'style', 'nav', 'footer', 'header', 'aside', 'iframe'])
  }

  /**
   * 抓取网页内容
   */
  async fetchUrl(url: string, options?: FetchOptions): Promise<FetchResult> {
    const opts = { ...this.defaultOptions, ...options }

    try {
      // 验证 URL
      const parsedUrl = new URL(url)
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Only HTTP and HTTPS URLs are supported')
      }

      Logger.info('WebFetchService', `Fetching: ${url}`)

      // 创建 AbortController 用于超时
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), opts.timeout)

      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': opts.userAgent,
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
          },
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status} ${response.statusText}`)
        }

        const contentType = response.headers.get('content-type') || ''
        if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
          throw new Error(`Unsupported content type: ${contentType}`)
        }

        const html = await response.text()
        return this.parseHtml(html, url, opts)
      } finally {
        clearTimeout(timeoutId)
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error(`Request timeout after ${opts.timeout}ms`)
      }
      Logger.error('WebFetchService', 'Failed to fetch URL:', error)
      throw error
    }
  }

  /**
   * 解析 HTML 内容
   */
  parseHtml(html: string, url: string, options?: FetchOptions): FetchResult {
    const opts = { ...this.defaultOptions, ...options }
    const $ = cheerio.load(html)

    // 提取标题
    const title = $('title').text().trim() || $('h1').first().text().trim()

    // 提取描述
    const description =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content')

    // 提取主要内容
    let content: string
    if (opts.extractMainContent) {
      content = this.extractMainContent($)
    } else {
      content = $('body').html() || ''
    }

    // 转换为 Markdown
    if (opts.convertToMarkdown) {
      content = this.htmlToMarkdown(content)
    } else {
      // 直接提取文本
      content = cheerio.load(content).text()
    }

    // 清理内容
    content = this.cleanContent(content)

    return {
      content,
      title,
      description: description || undefined,
      url,
      mimeType: 'text/html',
      metadata: {
        originalLength: html.length
      }
    }
  }

  /**
   * 提取主要内容
   */
  private extractMainContent($: cheerio.CheerioAPI): string {
    // 移除不需要的元素
    $(
      'script, style, nav, footer, header, aside, iframe, noscript, ' +
        '.nav, .navigation, .menu, .sidebar, .footer, .header, .ad, .advertisement, ' +
        '.comments, .comment, .social, .share, .related, .recommend'
    ).remove()

    // 尝试找到主要内容区域
    const mainSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.article',
      '.post',
      '.content',
      '.entry-content',
      '.post-content',
      '.article-content',
      '#content',
      '#main-content'
    ]

    for (const selector of mainSelectors) {
      const element = $(selector).first()
      if (element.length && element.text().trim().length > 200) {
        return element.html() || ''
      }
    }

    // 如果没有找到，使用 body
    return $('body').html() || ''
  }

  /**
   * HTML 转 Markdown
   */
  htmlToMarkdown(html: string): string {
    try {
      return this.turndown.turndown(html)
    } catch (error) {
      Logger.warn('WebFetchService', 'Failed to convert to Markdown, using plain text:', error)
      return cheerio.load(html).text()
    }
  }

  /**
   * 清理内容
   */
  private cleanContent(content: string): string {
    return (
      content
        // 移除多余空行
        .replace(/\n{3,}/g, '\n\n')
        // 移除行首尾空白
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
        // 移除首尾空白
        .trim()
    )
  }

  /**
   * 验证 URL 是否有效
   */
  isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      return ['http:', 'https:'].includes(parsed.protocol)
    } catch {
      return false
    }
  }
}
