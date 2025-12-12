import type { APIMessage } from '../../shared/types/chat'

/**
 * 验证并清理消息数组
 * 过滤空内容的消息、undefined/null 消息，确保基本格式正确
 */
export function validateAndCleanMessages(messages: APIMessage[]): APIMessage[] {
  const cleaned = messages.filter((msg) => {
    if (!msg) return false
    if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role)) return false
    if (typeof msg.content !== 'string') return false
    if (msg.content.trim() === '') return false
    return true
  })

  // 仅在有移除操作时输出警告
  if (messages.length !== cleaned.length) {
    console.warn(`[MessageValidator] 已移除 ${messages.length - cleaned.length} 条无效消息`)
  }

  return cleaned
}

/**
 * 移除连续的相同角色消息
 * 策略：保留最后一条（最新的消息）
 */
export function removeConsecutiveSameRole(messages: APIMessage[]): APIMessage[] {
  if (messages.length === 0) return []

  const cleaned: APIMessage[] = []
  let duplicateCount = 0

  for (const msg of messages) {
    const lastMsg = cleaned[cleaned.length - 1]

    if (!lastMsg || lastMsg.role !== msg.role) {
      // 不同角色，直接添加
      cleaned.push(msg)
    } else {
      // 相同角色，替换为最新的
      duplicateCount++
      cleaned[cleaned.length - 1] = msg
    }
  }

  // 仅在有移除操作时输出警告
  if (duplicateCount > 0) {
    console.warn(`[MessageValidator] 移除了 ${duplicateCount} 条连续重复消息`)
  }

  return cleaned
}

/**
 * 验证消息顺序是否符合规范
 * 检查是否存在连续的相同角色消息
 */
export function validateMessageOrder(messages: APIMessage[]): { valid: boolean; error?: string } {
  if (messages.length === 0) {
    return { valid: false, error: '消息数组为空' }
  }

  for (let i = 1; i < messages.length; i++) {
    if (messages[i].role === messages[i - 1].role) {
      return {
        valid: false,
        error: `消息索引 ${i} 处存在连续的 ${messages[i].role} 消息`
      }
    }
  }

  return { valid: true }
}

/**
 * 清理 DeepSeek 消息
 * 1. 移除 reasoning_content 字段（如果存在）
 * 2. 移除连续的相同角色消息
 * 3. 确保消息符合 DeepSeek API 要求
 */
export function cleanDeepSeekMessages(messages: APIMessage[]): APIMessage[] {
  // 1. 移除 reasoning_content 字段
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

  // 2. 移除连续的相同角色消息
  const cleaned = removeConsecutiveSameRole(withoutReasoning)

  // 仅在有实际清理操作时输出日志
  if (removedReasoningCount > 0 || cleaned.length !== withoutReasoning.length) {
    console.log(
      `[MessageValidator] DeepSeek 消息清理: 移除 ${removedReasoningCount} 个推理字段, ${withoutReasoning.length - cleaned.length} 条重复消息`
    )
  }

  return cleaned
}
