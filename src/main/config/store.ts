import type Store from 'electron-store'

/**
 * 应用设置接口
 */
export interface AppSettings {
  theme: 'light' | 'dark'
  language: 'zh-CN' | 'en-US' | 'ja-JP'
  autoLaunch: boolean
  defaultModel?: string
}

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
interface StoreSchema {
  settings: AppSettings
  providers: Record<string, ProviderConfig>
}

/**
 * 默认设置
 */
const defaultSettings: AppSettings = {
  theme: 'dark',
  language: 'zh-CN',
  autoLaunch: false,
  defaultModel: undefined
}

/**
 * 创建 electron-store 实例（使用动态导入）
 */
let store: Store<StoreSchema> | null = null

async function getStore(): Promise<Store<StoreSchema>> {
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

/**
 * 设置管理器
 */
export class SettingsManager {
  /**
   * 获取所有设置
   */
  async getAllSettings(): Promise<AppSettings> {
    const storeInstance = await getStore()
    return storeInstance.get('settings', defaultSettings)
  }

  /**
   * 获取单个设置
   */
  async getSetting<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
    const settings = await this.getAllSettings()
    return settings[key]
  }

  /**
   * 更新设置
   */
  async updateSettings(updates: Partial<AppSettings>): Promise<void> {
    const storeInstance = await getStore()
    const current = await this.getAllSettings()
    const newSettings = { ...current, ...updates }
    storeInstance.set('settings', newSettings)
  }

  /**
   * 设置单个值
   */
  async setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> {
    await this.updateSettings({ [key]: value } as Partial<AppSettings>)
  }

  /**
   * 重置为默认设置
   */
  async resetSettings(): Promise<void> {
    const storeInstance = await getStore()
    storeInstance.set('settings', defaultSettings)
  }

  /**
   * 监听设置变化
   */
  async onSettingsChange(
    callback: (newSettings: AppSettings, oldSettings: AppSettings) => void
  ): Promise<() => void> {
    const storeInstance = await getStore()
    return storeInstance.onDidChange('settings', (newValue, oldValue) => {
      if (newValue && oldValue) {
        callback(newValue, oldValue)
      }
    })
  }
}

/**
 * 提供商配置管理器
 */
export class ProvidersManager {
  /**
   * 保存提供商配置
   */
  async saveProviderConfig(
    providerName: string,
    config: Record<string, any>,
    enabled: boolean
  ): Promise<void> {
    const storeInstance = await getStore()
    const providers = storeInstance.get('providers', {})

    providers[providerName] = {
      providerName,
      config,
      enabled,
      updatedAt: Date.now()
    }

    storeInstance.set('providers', providers)
  }

  /**
   * 获取提供商配置
   */
  async getProviderConfig(providerName: string): Promise<ProviderConfig | null> {
    const storeInstance = await getStore()
    const providers = storeInstance.get('providers', {})
    return providers[providerName] || null
  }

  /**
   * 获取所有提供商配置
   */
  async getAllProviderConfigs(): Promise<ProviderConfig[]> {
    const storeInstance = await getStore()
    const providers = storeInstance.get('providers', {})
    return Object.values(providers)
  }

  /**
   * 删除提供商配置
   */
  async deleteProviderConfig(providerName: string): Promise<void> {
    const storeInstance = await getStore()
    const providers = storeInstance.get('providers', {})
    delete providers[providerName]
    storeInstance.set('providers', providers)
  }

  /**
   * 监听提供商配置变化
   */
  async onProvidersChange(
    callback: (
      newProviders: Record<string, ProviderConfig>,
      oldProviders: Record<string, ProviderConfig>
    ) => void
  ): Promise<() => void> {
    const storeInstance = await getStore()
    return storeInstance.onDidChange('providers', (newValue, oldValue) => {
      if (newValue && oldValue) {
        callback(newValue, oldValue)
      }
    })
  }
}

// 导出单例
export const settingsManager = new SettingsManager()
export const providersManager = new ProvidersManager()
