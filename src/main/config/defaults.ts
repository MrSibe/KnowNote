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
    },
    quiz: {
      'zh-CN': `你是一个专业的题目生成专家。请基于以下知识库内容，生成10道单选题用于知识测试。

**重要：请用中文回复，所有题目和选项必须使用中文。**

**输出格式要求（必须严格遵守）:**
你必须返回一个包含 questions 和 metadata 的 JSON 对象：
{
  "questions": [
    {
      "id": "题目唯一ID（字符串）",
      "questionText": "题目文本（不超过200字）",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "correctAnswer": 0,
      "explanation": "答案解释（不超过300字）",
      "hints": ["提示1", "提示2"],
      "metadata": {
        "chunkIds": ["相关chunk ID数组"]
      }
    }
  ],
  "metadata": {
    "totalQuestions": 10
  }
}

**题目要求:**
1. 生成**固定10道题**，每道题包含4个选项（A、B、C、D）
2. **只有一个正确答案**，correctAnswer为0-3的索引值
3. **每道题必须提供详细的答案解释**（为什么正确，其他选项错在哪里）
4. **每道题提供1-2个提示**（不要直接给出答案，而是引导思考方向）
5. 题目应该**基于提供的知识内容**，不要编造
6. 题目覆盖**不同的知识点**
7. 难度适中，适合用于知识回顾和巩固
8. 尽可能在 metadata.chunkIds 中关联相关的 chunk ID

**知识库内容:**
{{CONTENT}}

请生成10道高质量的单选题，严格按照格式要求返回 JSON。`,
      'en-US': `You are an expert quiz generator. Based on the knowledge base content below, generate 10 multiple-choice questions for knowledge testing.

**IMPORTANT: Please respond in English. All questions and options must be in English.**

**Output Format Requirements (MUST strictly follow):**
You must return a JSON object with questions and metadata:
{
  "questions": [
    {
      "id": "unique question ID (string)",
      "questionText": "question text (max 200 chars)",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "answer explanation (max 300 chars)",
      "hints": ["Hint 1", "Hint 2"],
      "metadata": {
        "chunkIds": ["array of related chunk IDs"]
      }
    }
  ],
  "metadata": {
    "totalQuestions": 10
  }
}

**Question Requirements:**
1. Generate **exactly 10 questions**, each with 4 options (A, B, C, D)
2. **Only one correct answer**, correctAnswer is an index value from 0-3
3. **Provide detailed explanation for each answer** (why it's correct, why others are wrong)
4. **Include 1-2 hints per question** (guide thinking, don't reveal answer directly)
5. Questions must be **based on provided content**, no fabrication
6. Cover **different knowledge points**
7. Moderate difficulty for knowledge review and reinforcement
8. Associate relevant chunk IDs in metadata.chunkIds whenever possible

**Knowledge base content:**
{{CONTENT}}

Generate 10 high-quality multiple-choice questions, strictly following the format requirements to return JSON.`
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
