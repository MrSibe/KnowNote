/**
 * IPC 参数验证
 * 使用 Zod 进行运行时类型验证，防止注入攻击和无效数据
 */

import { z } from 'zod'
import { Result, Err, Ok } from '../../shared/types/result'
import Logger from '../../shared/utils/logger'

/**
 * 笔记本相关的验证 schemas
 */
export const NotebookSchemas = {
  createNotebook: z.object({
    title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200个字符'),
    description: z.string().max(1000, '描述不能超过1000个字符').optional()
  }),

  updateNotebook: z.object({
    id: z.string().min(1, 'ID 不能为空'),
    updates: z.object({
      title: z.string().min(1).max(200).optional(),
      description: z.string().max(1000).optional()
    })
  }),

  deleteNotebook: z.object({
    id: z.string().min(1, 'ID 不能为空')
  }),

  getNotebook: z.object({
    id: z.string().min(1, 'ID 不能为空')
  })
}

/**
 * 笔记相关的验证 schemas
 */
export const NoteSchemas = {
  createNote: z.object({
    notebookId: z.string().min(1, { message: '笔记本 ID 不能为空' }),
    title: z
      .string()
      .min(1, { message: '标题不能为空' })
      .max(200, { message: '标题不能超过200个字符' }),
    content: z.string()
  }),

  updateNote: z.object({
    id: z.string().min(1, 'ID 不能为空'),
    updates: z.object({
      title: z.string().min(1).max(200).optional(),
      content: z.string().optional()
    })
  }),

  deleteNote: z.object({
    id: z.string().min(1, 'ID 不能为空')
  })
}

/**
 * Provider 相关的验证 schemas
 */
export const ProviderSchemas = {
  saveProviderConfig: z.object({
    providerName: z.string().min(1, { message: 'Provider 名称不能为空' }),
    config: z.record(z.string(), z.any()),
    enabled: z.boolean()
  }),

  getProviderConfig: z.object({
    providerName: z.string().min(1, 'Provider 名称不能为空')
  }),

  deleteProviderConfig: z.object({
    providerName: z.string().min(1, 'Provider 名称不能为空')
  }),

  fetchModels: z.object({
    providerName: z.string().min(1, 'Provider 名称不能为空')
  })
}

/**
 * 知识库相关的验证 schemas
 */
export const KnowledgeSchemas = {
  addDocumentFromFile: z.object({
    notebookId: z.string().min(1, '笔记本 ID 不能为空'),
    filePath: z.string().min(1, '文件路径不能为空')
  }),

  addDocumentFromUrl: z.object({
    notebookId: z.string().min(1, '笔记本 ID 不能为空'),
    url: z.string().url('无效的 URL')
  }),

  deleteDocument: z.object({
    documentId: z.string().min(1, '文档 ID 不能为空')
  }),

  search: z.object({
    notebookId: z.string().min(1, '笔记本 ID 不能为空'),
    query: z.string().min(1, '搜索查询不能为空').max(1000, '搜索查询不能超过1000个字符'),
    options: z
      .object({
        topK: z.number().int().min(1).max(100).optional(),
        threshold: z.number().min(0).max(1).optional(),
        includeContent: z.boolean().optional()
      })
      .optional()
  })
}

/**
 * 聊天相关的验证 schemas
 */
export const ChatSchemas = {
  sendMessage: z.object({
    sessionId: z.string().min(1, '会话 ID 不能为空'),
    content: z.string().min(1, '消息内容不能为空').max(10000, '消息内容不能超过10000个字符')
  }),

  createSession: z.object({
    notebookId: z.string().min(1, '笔记本 ID 不能为空'),
    title: z.string().max(200, '标题不能超过200个字符').optional()
  }),

  deleteSession: z.object({
    sessionId: z.string().min(1, '会话 ID 不能为空')
  })
}

/**
 * 验证函数包装器
 * 将 IPC handler 包装为自动验证参数的函数
 *
 * @param schema Zod schema
 * @param handler IPC handler 函数
 * @returns 包装后的 handler
 *
 * @example
 * ```ts
 * ipcMain.handle('create-notebook',
 *   validate(NotebookSchemas.createNotebook, async (args) => {
 *     return createNotebook(args.title, args.description)
 *   })
 * )
 * ```
 */
export function validate<TSchema extends z.ZodType, TResult>(
  schema: TSchema,
  handler: (args: z.infer<TSchema>) => Promise<TResult>
): (_event: Electron.IpcMainInvokeEvent, ...args: any[]) => Promise<TResult> {
  return async (_event: Electron.IpcMainInvokeEvent, ...args: any[]): Promise<TResult> => {
    try {
      // 如果只有一个参数，直接验证
      // 如果有多个参数，将其组合成对象
      const input = args.length === 1 ? args[0] : args

      // 验证输入
      const validatedArgs = schema.parse(input)

      // 调用实际的 handler
      return await handler(validatedArgs)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = `验证失败: ${error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`
        Logger.error('IPC Validation', errorMessage)
        throw new Error(errorMessage)
      }
      throw error
    }
  }
}

/**
 * 验证单个参数
 * 适用于只有一个参数的简单 handler
 *
 * @param schema Zod schema
 * @param value 要验证的值
 * @returns Result 对象
 *
 * @example
 * ```ts
 * const result = validateParam(z.string().min(1), userId)
 * if (!result.success) {
 *   throw new Error(result.error.message)
 * }
 * ```
 */
export function validateParam<T>(schema: z.ZodType<T>, value: unknown): Result<T> {
  try {
    const validated = schema.parse(value)
    return Ok(validated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      return Err(new Error(`验证失败: ${errorMessage}`))
    }
    return Err(error instanceof Error ? error : new Error(String(error)))
  }
}
