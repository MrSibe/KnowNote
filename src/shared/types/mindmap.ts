/**
 * 思维导图树节点(纯逻辑结构,不含UI信息)
 */
export interface MindMapTreeNode {
  id: string
  label: string // 节点文本,≤12字
  children?: MindMapTreeNode[]
  metadata?: {
    level: number // 层级: 0-3 (根节点为0)
    chunkIds?: string[] | null // 关联的chunk IDs，可为空
    keywords?: string[] | null // 关键词，可为空
  }
}

/**
 * LLM生成的原始输出格式
 */
export interface MindMapGenerationResult {
  rootNode: MindMapTreeNode
  chunkMapping: Record<string, string[]> // nodeId -> chunkIds
  metadata: {
    totalNodes: number
    maxDepth: number
  }
}
