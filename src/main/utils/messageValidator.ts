import type { APIMessage } from '../../shared/types/chat'
import Logger from '../../shared/utils/logger'

/**
 * Validate and clean message array
 * Filter empty content messages, undefined/null messages, ensure basic format is correct
 */
export function validateAndCleanMessages(messages: APIMessage[]): APIMessage[] {
  const cleaned = messages.filter((msg) => {
    if (!msg) return false
    if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role)) return false
    if (typeof msg.content !== 'string') return false
    if (msg.content.trim() === '') return false
    return true
  })

  // Only output warning when there are removals
  if (messages.length !== cleaned.length) {
    Logger.warn('MessageValidator', `Removed ${messages.length - cleaned.length} invalid messages`)
  }

  return cleaned
}

/**
 * Remove consecutive same role messages
 * Strategy: Keep the last one (newest message)
 */
export function removeConsecutiveSameRole(messages: APIMessage[]): APIMessage[] {
  if (messages.length === 0) return []

  const cleaned: APIMessage[] = []
  let duplicateCount = 0

  for (const msg of messages) {
    const lastMsg = cleaned[cleaned.length - 1]

    if (!lastMsg || lastMsg.role !== msg.role) {
      // Different roles, add directly
      cleaned.push(msg)
    } else {
      // Same role, replace with newest
      duplicateCount++
      cleaned[cleaned.length - 1] = msg
    }
  }

  // Only output warning when there are removals
  if (duplicateCount > 0) {
    Logger.warn('MessageValidator', `Removed ${duplicateCount} consecutive duplicate messages`)
  }

  return cleaned
}

/**
 * Validate if message order complies with specification
 * Check for consecutive same role messages
 */
export function validateMessageOrder(messages: APIMessage[]): { valid: boolean; error?: string } {
  if (messages.length === 0) {
    return { valid: false, error: 'Message array is empty' }
  }

  for (let i = 1; i < messages.length; i++) {
    if (messages[i].role === messages[i - 1].role) {
      return {
        valid: false,
        error: `Consecutive ${messages[i].role} messages found at index ${i}`
      }
    }
  }

  return { valid: true }
}

/**
 * Clean DeepSeek messages
 * 1. Remove reasoning_content field (if exists)
 * 2. Remove consecutive same role messages
 * 3. Ensure messages comply with DeepSeek API requirements
 */
export function cleanDeepSeekMessages(messages: APIMessage[]): APIMessage[] {
  // 1. Remove reasoning_content field
  let removedReasoningCount = 0
  const withoutReasoning = messages.map((msg) => {
    if (msg.role === 'assistant' && 'reasoning_content' in msg) {
      removedReasoningCount++
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { reasoning_content, ...rest } = msg as any
      return rest
    }
    return msg
  })

  // 2. Remove consecutive same role messages
  const cleaned = removeConsecutiveSameRole(withoutReasoning)

  // Only output log when there are actual cleanup operations
  if (removedReasoningCount > 0 || cleaned.length !== withoutReasoning.length) {
    Logger.info(
      'MessageValidator',
      `DeepSeek message cleanup: removed ${removedReasoningCount} reasoning fields, ${withoutReasoning.length - cleaned.length} duplicate messages`
    )
  }

  return cleaned
}
