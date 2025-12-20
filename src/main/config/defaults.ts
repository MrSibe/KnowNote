import type { AppSettings } from './types'

/**
 * 默认设置 - 单一数据源
 * 所有默认配置都在这里定义，其他地方只引用
 */
export const defaultSettings: AppSettings = {
  theme: 'dark',
  language: 'zh-CN',
  autoLaunch: false,
  defaultChatModel: undefined,
  defaultEmbeddingModel: undefined,
  prompts: {
    mindMap: {
      'zh-CN': `你是知识结构分析专家,负责从笔记本内容中提炼核心知识结构。

**重要：请用中文回复，所有节点标签必须使用中文。**

**输出格式要求（必须严格遵守）:**
你必须返回一个包含 rootNode 和 metadata 的 JSON 对象：
{
  "rootNode": {
    "id": "节点唯一ID（字符串）",
    "label": "节点标签（必须≤12字）",
    "metadata": {
      "level": 0,
      "chunkIds": ["相关chunk ID数组"],
      "keywords": ["关键词数组（可选）"]
    },
    "children": [子节点数组，每个子节点结构相同]
  },
  "metadata": {
    "totalNodes": 总节点数（数字）,
    "maxDepth": 最大深度（数字）
  }
}

**内容要求:**
1. **所有节点标签必须用中文，且严格 ≤ 12字**（非常重要！）
2. 层级深度 ≤ 4层（根节点level=0, 最深level=3）
3. 每个父节点必须有 2-5 个子节点
4. 每个节点的 id 必须唯一
5. 尽可能在 metadata.chunkIds 中关联相关的 chunk ID
6. totalNodes 必须等于实际节点总数
7. maxDepth 必须等于实际最大层级深度

**笔记本内容:**
{{CONTENT}}

请基于以上内容生成思维导图结构，严格按照格式要求返回 JSON。`,
      'en-US': `You are a knowledge structure analysis expert, responsible for extracting core knowledge structures from notebook content.

**IMPORTANT: Please respond in English. All node labels must be in English.**

**Output Format Requirements (MUST strictly follow):**
You must return a JSON object with rootNode and metadata:
{
  "rootNode": {
    "id": "unique node ID (string)",
    "label": "node label (must be ≤24 characters)",
    "metadata": {
      "level": 0,
      "chunkIds": ["array of related chunk IDs"],
      "keywords": ["array of keywords (optional)"]
    },
    "children": [array of child nodes, each with same structure]
  },
  "metadata": {
    "totalNodes": total number of nodes (number),
    "maxDepth": maximum depth (number)
  }
}

**Content Requirements:**
1. **All node labels must be in English and strictly ≤ 24 characters** (VERY IMPORTANT!)
2. Hierarchy depth ≤ 4 levels (root node level=0, deepest level=3)
3. Each parent node must have 2-5 child nodes
4. Each node's id must be unique
5. Associate relevant chunk IDs in metadata.chunkIds whenever possible
6. totalNodes must equal the actual total number of nodes
7. maxDepth must equal the actual maximum hierarchy depth

**Notebook Content:**
{{CONTENT}}

Please generate a mind map structure based on the above content, strictly following the format requirements to return JSON.`
    }
  }
}
