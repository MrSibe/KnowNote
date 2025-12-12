import type { LLMProvider, ChatMessage, StreamChunk, LLMProviderConfig } from './types'
import Logger from '../../shared/utils/logger'

/**
 * Ollama Provider Implementation
 * For locally running Ollama service
 */
export class OllamaProvider implements LLMProvider {
  readonly name = 'ollama'

  private config: LLMProviderConfig = {
    baseUrl: 'http://localhost:11434',
    model: 'llama2',
    temperature: 0.7
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
    const { baseUrl, model, temperature } = this.config

    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          options: {
            temperature
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Ollama API Error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Unable to read response stream')
      }

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n').filter((line) => line.trim())

        for (const line of lines) {
          try {
            const json = JSON.parse(line)

            // Send content chunk
            if (json.message?.content) {
              onChunk({
                content: json.message.content,
                done: json.done || false
              })
            }

            // Completion marker
            if (json.done) {
              onChunk({
                content: '',
                done: true,
                metadata: {
                  model: json.model,
                  finishReason: json.done_reason
                }
              })
            }
          } catch (e) {
            Logger.error('OllamaProvider', 'Failed to parse response:', e)
          }
        }
      }

      onComplete()
    } catch (error) {
      onError(error as Error)
    }
  }

  /**
   * Validate if Ollama service is available
   */
  async validateConfig(config: LLMProviderConfig): Promise<boolean> {
    try {
      const response = await fetch(`${config.baseUrl}/api/tags`)
      return response.ok
    } catch {
      return false
    }
  }
}
