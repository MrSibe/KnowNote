import type Store from 'electron-store'
import type { ProviderConfig } from './types'

/**
 * 提供商配置管理器
 */
export class ProvidersManager {
  private getStore: () => Promise<Store<any>>

  constructor(getStore: () => Promise<Store<any>>) {
    this.getStore = getStore
  }

  /**
   * 保存提供商配置
   */
  async saveProviderConfig(
    providerName: string,
    config: Record<string, any>,
    enabled: boolean
  ): Promise<void> {
    const store = await this.getStore()
    const providers = store.get('providers', {})

    providers[providerName] = {
      providerName,
      config,
      enabled,
      updatedAt: Date.now()
    }

    store.set('providers', providers)
  }

  /**
   * 获取提供商配置
   */
  async getProviderConfig(providerName: string): Promise<ProviderConfig | null> {
    const store = await this.getStore()
    const providers = store.get('providers', {})
    return providers[providerName] || null
  }

  /**
   * 获取所有提供商配置
   */
  async getAllProviderConfigs(): Promise<ProviderConfig[]> {
    const store = await this.getStore()
    const providers = store.get('providers', {})
    return Object.values(providers)
  }

  /**
   * 删除提供商配置
   */
  async deleteProviderConfig(providerName: string): Promise<void> {
    const store = await this.getStore()
    const providers = store.get('providers', {})
    delete providers[providerName]
    store.set('providers', providers)
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
    const store = await this.getStore()
    return store.onDidChange('providers', (newValue, oldValue) => {
      if (newValue && oldValue) {
        callback(newValue, oldValue)
      }
    })
  }

  /**
   * 保存提供商模型列表
   */
  async saveProviderModels(providerName: string, models: any[]): Promise<void> {
    const store = await this.getStore()
    const modelsData = store.get('models', {})

    modelsData[providerName] = {
      models,
      updatedAt: Date.now()
    }

    store.set('models', modelsData)
  }

  /**
   * 获取提供商模型列表
   */
  async getProviderModels(providerName: string): Promise<any[]> {
    const store = await this.getStore()
    const modelsData = store.get('models', {})
    const providerModels = modelsData[providerName]

    // 如果模型数据超过24小时，返回空数组提示重新获取
    if (providerModels && providerModels.updatedAt) {
      const hoursSinceUpdate = (Date.now() - providerModels.updatedAt) / (1000 * 60 * 60)
      if (hoursSinceUpdate > 24) {
        return []
      }
    }

    return providerModels?.models || []
  }
}
