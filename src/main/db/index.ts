import { app } from 'electron'
import { join } from 'path'
import { stat } from 'fs/promises'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as sqliteVec from 'sqlite-vec'
import * as schema from './schema'

let sqlite: Database.Database | null = null
let db: ReturnType<typeof drizzle> | null = null
let checkpointTimer: NodeJS.Timeout | null = null
let truncateTimer: NodeJS.Timeout | null = null
let isClosing = false // 防止重复关闭

/**
 * 初始化数据库连接
 * 在 Electron 主进程的 app.whenReady() 中调用
 */
export function initDatabase() {
  // 数据库文件存放在用户数据目录
  const dbPath = join(app.getPath('userData'), 'litebook.db')

  console.log('[Database] Initializing database at:', dbPath)

  try {
    // 创建 SQLite 数据库实例
    sqlite = new Database(dbPath)

    // 加载 sqlite-vec 扩展
    sqliteVec.load(sqlite)
    console.log('[Database] sqlite-vec extension loaded')

    // 验证 sqlite-vec 版本
    const vecVersion = sqlite.prepare('SELECT vec_version() as version').get() as {
      version: string
    }
    console.log('[Database] sqlite-vec version:', vecVersion?.version)

    // 启用 WAL 模式以提高性能
    sqlite.pragma('journal_mode = WAL')

    // 优化 WAL 配置
    sqlite.pragma('wal_autocheckpoint = 100') // 每 100 页自动 checkpoint（降低默认值）
    sqlite.pragma('synchronous = NORMAL') // WAL 模式推荐设置
    sqlite.pragma('busy_timeout = 5000') // 5 秒超时，防止并发冲突

    // 记录当前配置
    const journalMode = sqlite.pragma('journal_mode', { simple: true })
    const walCheckpoint = sqlite.pragma('wal_autocheckpoint', { simple: true })
    const syncMode = sqlite.pragma('synchronous', { simple: true })
    console.log('[Database] Configuration:', {
      journal_mode: journalMode,
      wal_autocheckpoint: walCheckpoint,
      synchronous: syncMode
    })

    // 创建 Drizzle 实例
    db = drizzle(sqlite, { schema })

    // 数据库完整性检查
    const integrityCheck = sqlite.pragma('integrity_check', { simple: true })
    if (integrityCheck !== 'ok') {
      console.error('[Database] Integrity check failed:', integrityCheck)
    } else {
      console.log('[Database] Integrity check passed')
    }

    // 启动定期 checkpoint 机制
    startPeriodicCheckpoint(dbPath)

    console.log('[Database] Database initialized successfully')
    return db
  } catch (error) {
    console.error('[Database] Failed to initialize database:', error)
    throw error
  }
}

/**
 * 启动定期 checkpoint 机制
 */
function startPeriodicCheckpoint(dbPath: string) {
  const walPath = `${dbPath}-wal`

  // 每 30 秒检查 WAL 文件大小并执行 PASSIVE checkpoint
  checkpointTimer = setInterval(async () => {
    try {
      if (!sqlite || isClosing) return

      const stats = await stat(walPath).catch(() => null)
      if (stats && stats.size > 1024 * 1024) {
        // 1MB
        console.log(
          `[Database] WAL file size: ${(stats.size / 1024 / 1024).toFixed(2)}MB, executing PASSIVE checkpoint...`
        )
        const result = sqlite.pragma('wal_checkpoint(PASSIVE)')
        console.log('[Database] PASSIVE checkpoint result:', result)
      }
    } catch (error) {
      console.error('[Database] Error during periodic checkpoint:', error)
    }
  }, 30000) // 30 秒

  checkpointTimer.unref() // 不阻止进程退出

  // 每 5 分钟执行一次 TRUNCATE checkpoint，清理 WAL 文件
  truncateTimer = setInterval(() => {
    try {
      if (!sqlite || isClosing) return

      console.log('[Database] Executing scheduled TRUNCATE checkpoint...')
      const result = sqlite.pragma('wal_checkpoint(TRUNCATE)')
      console.log('[Database] TRUNCATE checkpoint result:', result)
    } catch (error) {
      console.error('[Database] Error during truncate checkpoint:', error)
    }
  }, 300000) // 5 分钟

  truncateTimer.unref()
}

/**
 * 执行主动 checkpoint（供外部调用）
 */
export function executeCheckpoint(mode: 'PASSIVE' | 'FULL' | 'RESTART' | 'TRUNCATE' = 'PASSIVE') {
  if (!sqlite) return

  try {
    console.log(`[Database] Executing ${mode} checkpoint...`)
    const result = sqlite.pragma(`wal_checkpoint(${mode})`)
    console.log(`[Database] ${mode} checkpoint result:`, result)
  } catch (error) {
    console.error(`[Database] Error executing ${mode} checkpoint:`, error)
  }
}

/**
 * 运行数据库迁移
 * 在初始化数据库后立即调用
 */
export function runMigrations() {
  if (!db) {
    throw new Error('[Database] Database not initialized. Call initDatabase() first.')
  }

  // __dirname 在编译后指向 out/main（所有代码打包到 out/main/index.js）
  // 而 migrations 文件被复制到 out/main/db/migrations
  const migrationsFolder = join(__dirname, 'db', 'migrations')
  console.log('[Database] Running migrations from:', migrationsFolder)

  try {
    migrate(db, { migrationsFolder })
    console.log('[Database] Migrations completed successfully')
  } catch (error) {
    console.error('[Database] Migration failed:', error)
    throw error
  }
}

/**
 * 初始化向量存储表
 * 创建 sqlite-vec 的 vec0 虚拟表用于向量检索
 * 在 runMigrations 后调用
 */
export function initVectorStore() {
  if (!sqlite) {
    throw new Error('[Database] Database not initialized. Call initDatabase() first.')
  }

  console.log('[Database] Initializing vector store...')

  try {
    // 创建向量索引虚拟表（如果不存在）
    // 使用 cosine 距离度量，1024 维度（BAAI/bge-m3 默认维度）
    sqlite.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS vec_embeddings USING vec0(
        embedding_id TEXT PRIMARY KEY,
        chunk_id TEXT,
        notebook_id TEXT,
        embedding FLOAT[1024] distance_metric=cosine
      );
    `)

    console.log('[Database] Vector store initialized successfully')
  } catch (error) {
    console.error('[Database] Failed to initialize vector store:', error)
    throw error
  }
}

/**
 * 获取数据库实例
 * 在需要执行数据库操作时调用
 */
export function getDatabase() {
  if (!db) {
    throw new Error('[Database] Database not initialized. Call initDatabase() first.')
  }
  return db
}

/**
 * 优雅关闭数据库连接
 * 在 Electron app.on('before-quit') 中调用
 */
export function closeDatabase() {
  if (isClosing || !sqlite) {
    console.log('[Database] Database already closed or closing')
    return
  }

  isClosing = true
  console.log('[Database] Starting graceful database closure...')

  try {
    // 清除定时器
    if (checkpointTimer) {
      clearInterval(checkpointTimer)
      checkpointTimer = null
    }
    if (truncateTimer) {
      clearInterval(truncateTimer)
      truncateTimer = null
    }

    // 执行最终 checkpoint，强制合并所有 WAL 数据到主数据库
    console.log('[Database] Executing final RESTART checkpoint before closing...')
    const checkpointResult = sqlite.pragma('wal_checkpoint(RESTART)')
    console.log('[Database] Final checkpoint result:', checkpointResult)

    // 关闭数据库连接
    sqlite.close()
    console.log('[Database] Database connection closed successfully')

    sqlite = null
    db = null
  } catch (error) {
    console.error('[Database] Error during database closure:', error)
    // 即使出错也要清理引用
    sqlite = null
    db = null
  } finally {
    isClosing = false
  }
}

/**
 * 获取原始 SQLite 实例（用于 pragma 等操作）
 */
export function getSqlite() {
  return sqlite
}

// 导出类型供其他模块使用
export type Database = NonNullable<typeof db>
