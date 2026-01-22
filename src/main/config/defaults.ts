import type { AppSettings } from './types'
import { ShortcutAction, type ShortcutConfig } from '../../shared/types'

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
      'zh-CN': `你是专业的知识结构分析专家。请仔细分析笔记本内容，提炼核心知识结构，生成层次清晰的思维导图。

## 核心要求

**1. 必须使用中文**
- 所有节点标签（label）必须使用中文
- 每个节点标签严格限制在 12 个汉字以内（包含标点符号）
- 标签要简洁有力，突出核心概念

**2. 结构层次要求**
- 深度：最多 4 层（根节点 level=0，最深子节点 level=3）
- 广度：每个父节点必须有 2-5 个子节点
- 平衡：尽量保持树形结构的平衡，避免某一分支过深或过浅

**3. 节点设计原则**
- 根节点：概括笔记本的整体主题
- 一级子节点：主要知识领域或章节
- 二级子节点：具体知识点或子主题
- 三级子节点：详细概念或实例

**4. 数据关联要求**
- chunkIds：如果节点内容来源于特定的文档片段，必须在 metadata.chunkIds 中列出相关的 chunk ID（不是推测，而是从提供的内容中实际存在的）
- 如果无法确定具体的 chunk ID，设置为空数组 [] 而非 null
- keywords：可选，提取该节点的 2-3 个关键词，设置为空数组 [] 而非 null

## 严格的输出格式（JSON）

\`\`\`json
{
  "rootNode": {
    "id": "0",
    "label": "主题名称",
    "metadata": {
      "level": 0,
      "chunkIds": [],
      "keywords": ["关键词1", "关键词2"]
    },
    "children": [
      {
        "id": "1",
        "label": "子主题",
        "metadata": {
          "level": 1,
          "chunkIds": [],
          "keywords": []
        },
        "children": []
      }
    ]
  },
  "metadata": {
    "totalNodes": 实际节点总数,
    "maxDepth": 实际最大深度
  }
}
\`\`\`

## 字段说明

- **id**: 字符串，唯一标识符，建议使用数字编号
- **label**: 字符串，节点显示文本，≤12 个汉字
- **level**: 数字，0-3，表示层级深度
- **chunkIds**: 字符串数组，相关文档片段 ID，无关联时使用 []
- **keywords**: 字符串数组，可选关键词，不需要时使用 []
- **children**: 数组，子节点列表，叶子节点可省略或设为 []
- **totalNodes**: 数字，必须等于实际生成的节点总数
- **maxDepth**: 数字，必须等于实际的最大层级（0-3）

## 笔记本内容

{{CONTENT}}

## 生成指导

1. 先通读全部内容，识别主要主题和知识结构
2. 设计根节点，用一个精炼的短语概括整体
3. 将内容分解为 2-5 个主要领域作为一级子节点
4. 继续细化每个主要领域为 2-5 个知识点
5. 如需更深层次，再细化到具体概念（但不超过 3 级子节点）
6. 确保节点 ID 唯一且连续
7. 统计总节点数和最大深度，填入 metadata

请严格按照上述格式返回 JSON 对象。`,
      'en-US': `You are a professional knowledge structure analysis expert. Please carefully analyze the notebook content, extract the core knowledge structure, and generate a well-organized mind map.

## Core Requirements

**1. Language Requirement**
- All node labels must be in English
- Each node label strictly limited to 24 characters (including punctuation)
- Labels should be concise and highlight core concepts

**2. Structural Hierarchy Requirements**
- Depth: Maximum 4 levels (root node level=0, deepest child level=3)
- Breadth: Each parent node must have 2-5 child nodes
- Balance: Maintain balanced tree structure, avoid overly deep or shallow branches

**3. Node Design Principles**
- Root node: Summarize the overall theme of the notebook
- Level-1 children: Main knowledge domains or chapters
- Level-2 children: Specific knowledge points or sub-topics
- Level-3 children: Detailed concepts or examples

**4. Data Association Requirements**
- chunkIds: If node content comes from specific document fragments, must list relevant chunk IDs in metadata.chunkIds (from actual provided content, not speculation)
- If unable to determine specific chunk IDs, set to empty array [] instead of null
- keywords: Optional, extract 2-3 keywords for the node, set to [] instead of null when not needed

## Strict Output Format (JSON)

\`\`\`json
{
  "rootNode": {
    "id": "0",
    "label": "Topic Name",
    "metadata": {
      "level": 0,
      "chunkIds": [],
      "keywords": ["keyword1", "keyword2"]
    },
    "children": [
      {
        "id": "1",
        "label": "Sub-topic",
        "metadata": {
          "level": 1,
          "chunkIds": [],
          "keywords": []
        },
        "children": []
      }
    ]
  },
  "metadata": {
    "totalNodes": actual_total_node_count,
    "maxDepth": actual_max_depth
  }
}
\`\`\`

## Field Descriptions

- **id**: String, unique identifier, suggest using numeric sequence
- **label**: String, node display text, ≤24 characters
- **level**: Number, 0-3, indicates hierarchy depth
- **chunkIds**: String array, related document fragment IDs, use [] when no association
- **keywords**: String array, optional keywords, use [] when not needed
- **children**: Array, child node list, can be omitted or set to [] for leaf nodes
- **totalNodes**: Number, must equal actual generated node count
- **maxDepth**: Number, must equal actual maximum level (0-3)

## Notebook Content

{{CONTENT}}

## Generation Guidelines

1. Read through all content, identify main themes and knowledge structure
2. Design root node, summarize overall theme in a concise phrase
3. Break down content into 2-5 main domains as level-1 children
4. Continue refining each main domain into 2-5 knowledge points
5. If deeper levels needed, refine to specific concepts (but not exceeding level-3 children)
6. Ensure node IDs are unique and sequential
7. Count total nodes and max depth, fill into metadata

Please strictly return JSON object following the above format.`
    }
  }
}

/**
 * 默认快捷键配置
 */
export const defaultShortcuts: ShortcutConfig[] = [
  // 笔记本管理
  {
    action: ShortcutAction.CREATE_NOTEBOOK,
    accelerator: 'CommandOrControl+N',
    enabled: true,
    description: 'shortcuts:createNotebook'
  },
  {
    action: ShortcutAction.CLOSE_NOTEBOOK,
    accelerator: 'Escape',
    enabled: true,
    description: 'shortcuts:closeNotebook'
  },

  // 面板切换
  {
    action: ShortcutAction.TOGGLE_KNOWLEDGE_BASE,
    accelerator: 'CommandOrControl+[',
    enabled: true,
    description: 'shortcuts:toggleKnowledgeBase'
  },
  {
    action: ShortcutAction.TOGGLE_CREATIVE_SPACE,
    accelerator: 'CommandOrControl+]',
    enabled: true,
    description: 'shortcuts:toggleCreativeSpace'
  }
]
