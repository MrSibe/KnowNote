import type { AppSettings } from '../../shared/types'

/**
 * 提供商配置接口
 */
export interface ProviderConfig {
  providerName: string
  config: Record<string, any>
  enabled: boolean
  updatedAt: number
}

/**
 * Store Schema 定义
 */
export interface StoreSchema {
  settings: AppSettings
  providers: Record<string, ProviderConfig>
}

// 重新导出 AppSettings 以保持向后兼容
export type { AppSettings }
