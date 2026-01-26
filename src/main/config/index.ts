/**
 * 配置管理模块统一导出
 */

export { getStore } from './store'
export { SettingsManager } from './settingsManager'
export { ProviderConfigManager } from './ProviderConfigManager'
// 向后兼容导出(已废弃)
export { ProviderConfigManager as ProvidersManager } from './ProviderConfigManager'
export type { AppSettings, ProviderConfig, StoreSchema } from './types'
export { defaultSettings } from './defaults'

// 导出单例实例
import { getStore } from './store'
import { SettingsManager } from './settingsManager'
import { ProviderConfigManager } from './ProviderConfigManager'

export const settingsManager = new SettingsManager(getStore)
export const providersManager = new ProviderConfigManager(getStore)
export const providerConfigManager = providersManager // 新名称的别名
