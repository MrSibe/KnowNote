import type { LLMProvider, ChatMessage, StreamChunk, LLMProviderConfig } from './types'

/**
 * DeepSeek Provider 实现
 * DeepSeek API 兼容 OpenAI API 格式
 */
export class DeepSeekProvider implements LLMProvider {
  readonly name = 'deepseek'

  private config: LLMProviderConfig = {
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 2048
  }

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
      onError(new Error('DeepSeek API Key 未配置'))
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
        throw new Error(`DeepSeek API Error: ${response.status} - ${errorText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法读取响应流')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        // 将字节解码为文本并追加到缓冲区
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')

        // 保留最后一个未完成的行
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()

          // 跳过空行和注释
          if (!trimmed || trimmed === 'data: [DONE]') continue

          // 解析 SSE 数据
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6))
              const delta = json.choices?.[0]?.delta
              const finishReason = json.choices?.[0]?.finish_reason

              // 发送内容片段
              if (delta?.content) {
                onChunk({
                  content: delta.content,
                  done: false
                })
              }

              // 完成标志
              if (finishReason) {
                onChunk({
                  content: '',
                  done: true,
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
              console.error('[DeepSeekProvider] 解析 SSE 数据失败:', e)
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
   * 验证 API Key 是否有效
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
}
