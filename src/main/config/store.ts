import type Store from 'electron-store'
import type { StoreSchema, AppSettings } from './types'

/**
 * 默认设置
 */
const defaultSettings: AppSettings = {
  theme: 'dark',
  language: 'zh-CN',
  autoLaunch: false,
  defaultChatModel: undefined,
  defaultEmbeddingModel: undefined
}

/**
 * 创建 electron-store 实例（使用动态导入）
 */
let store: Store<StoreSchema> | null = null

export async function getStore(): Promise<Store<StoreSchema>> {
  if (!store) {
    const { default: Store } = await import('electron-store')
    store = new Store<StoreSchema>({
      defaults: {
        settings: defaultSettings,
        providers: {}
      },
      name: 'litebook-config',
      // 文件会保存在: ~/Library/Application Support/litebook/litebook-config.json (macOS)
      encryptionKey: undefined // 如果需要加密可以设置密钥
    })
  }
  return store
}
