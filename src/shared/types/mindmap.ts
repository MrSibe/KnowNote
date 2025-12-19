/**
 * 思维导图树节点(纯逻辑结构,不含UI信息)
 */
export interface MindMapTreeNode {
  id: string
  label: string // 节点文本,≤12字
  children?: MindMapTreeNode[]
  metadata?: {
    level: number // 层级: 0-3 (根节点为0)
    chunkIds: string[] // 关联的chunk IDs
    keywords?: string[]
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
