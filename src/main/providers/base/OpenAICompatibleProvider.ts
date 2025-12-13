import type {
  LLMProvider,
  ChatMessage,
  StreamChunk,
  LLMProviderConfig,
  EmbeddingConfig,
  EmbeddingResult
} from '../types'
import Logger from '../../../shared/utils/logger'

/**
 * OpenAI Compatible API Provider Abstract Base Class
 * Used for all providers compatible with OpenAI API format (e.g., OpenAI, DeepSeek, Kimi, etc.)
 *
 * Subclasses only need to define the following properties:
 * - name: Provider name
 * - getDefaultBaseUrl(): Default API base URL
 * - getDefaultModel(): Default model name
 */
export abstract class OpenAICompatibleProvider implements LLMProvider {
  abstract readonly name: string

  protected config: LLMProviderConfig = {
    baseUrl: this.getDefaultBaseUrl(),
    model: this.getDefaultModel(),
    temperature: 0.7,
    maxTokens: 2048
  }

  /**
   * Get default API base URL
   */
  protected abstract getDefaultBaseUrl(): string

  /**
   * Get default model name
   */
  protected abstract getDefaultModel(): string

  configure(config: LLMProviderConfig): void {
    this.config = { ...this.config, ...config }
  }

  async sendMessageStream(
    messages: ChatMessage[],
    onChunk: (chunk: StreamChunk) => void,
    onError: (error: Error) => void,
    onComplete: () => void
  ): Promise<void> {
    const { apiKey, baseUrl, model, temperature, maxTokens } = this.config

    if (!apiKey) {
      onError(new Error(`${this.name} API Key not configured`))
      return
    }

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: true
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`${this.name} API Error: ${response.status} - ${errorText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Unable to read response stream')
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let hasReceivedReasoning = false // Track if reasoning content has been received
      let reasoningComplete = false // Track if reasoning is complete

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        // Decode bytes to text and append to buffer
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')

        // Keep the last incomplete line
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()

          // Skip empty lines and comments
          if (!trimmed || trimmed === 'data: [DONE]') continue

          // Parse SSE data
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6))
              const delta = json.choices?.[0]?.delta
              const finishReason = json.choices?.[0]?.finish_reason

              // Track reasoning content status
              if (delta?.reasoning_content) {
                hasReceivedReasoning = true
              } else if (hasReceivedReasoning && !reasoningComplete) {
                // Had reasoning content before, now none, means reasoning phase is over
                reasoningComplete = true
              }

              // Send content chunk (including reasoning content)
              if (delta?.content || delta?.reasoning_content) {
                onChunk({
                  content: delta.content || '',
                  reasoningContent: delta.reasoning_content,
                  done: false,
                  reasoningDone: reasoningComplete
                })
              }

              // Completion marker
              if (finishReason) {
                onChunk({
                  content: '',
                  reasoningContent: undefined,
                  done: true,
                  reasoningDone: true,
                  metadata: {
                    model: json.model,
                    finishReason,
                    usage: json.usage
                      ? {
                          promptTokens: json.usage.prompt_tokens,
                          completionTokens: json.usage.completion_tokens,
                          totalTokens: json.usage.total_tokens
                        }
                      : undefined
                  }
                })
              }
            } catch (e) {
              Logger.error(`${this.name}Provider`, 'Failed to parse SSE data:', e)
            }
          }
        }
      }

      onComplete()
    } catch (error) {
      onError(error as Error)
    }
  }

  /**
   * Validate if API Key is valid
   */
  async validateConfig(config: LLMProviderConfig): Promise<boolean> {
    try {
      const response = await fetch(`${config.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`
        }
      })
      return response.ok
    } catch {
      return false
    }
  }

  // ==================== Embedding API ====================

  /**
   * 获取默认 Embedding 模型
   * 子类可以覆盖此方法以使用不同的默认模型
   */
  getDefaultEmbeddingModel(): string {
    return 'text-embedding-3-small'
  }

  /**
   * 检查是否支持 Embedding
   * 默认所有 OpenAI 兼容的 Provider 都支持
   */
  supportsEmbedding(): boolean {
    return true
  }

  /**
   * 生成单个文本的 Embedding
   */
  async createEmbedding(text: string, config?: EmbeddingConfig): Promise<EmbeddingResult> {
    const { apiKey, baseUrl } = this.config
    const model = config?.model || this.config.model || this.getDefaultEmbeddingModel()

    if (!apiKey) {
      throw new Error(`${this.name} API Key not configured`)
    }

    try {
      const requestBody: Record<string, unknown> = {
        model,
        input: text
      }

      // 部分模型支持指定维度
      if (config?.dimensions) {
        requestBody.dimensions = config.dimensions
      }

      const response = await fetch(`${baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`${this.name} Embedding API Error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      const embeddingData = data.data[0].embedding as number[]

      return {
        embedding: new Float32Array(embeddingData),
        model: data.model,
        dimensions: embeddingData.length,
        tokensUsed: data.usage?.total_tokens || 0
      }
    } catch (error) {
      Logger.error(`${this.name}Provider`, 'Failed to create embedding:', error)
      throw error
    }
  }

  /**
   * 批量生成 Embedding
   */
  async createEmbeddings(texts: string[], config?: EmbeddingConfig): Promise<EmbeddingResult[]> {
    const { apiKey, baseUrl } = this.config
    const model = config?.model || this.config.model || this.getDefaultEmbeddingModel()

    if (!apiKey) {
      throw new Error(`${this.name} API Key not configured`)
    }

    if (texts.length === 0) {
      return []
    }

    try {
      const requestBody: Record<string, unknown> = {
        model,
        input: texts
      }

      // 部分模型支持指定维度
      if (config?.dimensions) {
        requestBody.dimensions = config.dimensions
      }

      const response = await fetch(`${baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`${this.name} Embedding API Error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      const tokensPerText = Math.ceil((data.usage?.total_tokens || 0) / texts.length)

      return data.data.map((item: { embedding: number[]; index: number }) => ({
        embedding: new Float32Array(item.embedding),
        model: data.model,
        dimensions: item.embedding.length,
        tokensUsed: tokensPerText
      }))
    } catch (error) {
      Logger.error(`${this.name}Provider`, 'Failed to create embeddings:', error)
      throw error
    }
  }
}
