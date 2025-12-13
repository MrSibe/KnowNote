import { ipcMain, BrowserWindow } from 'electron'
import { ProviderManager } from '../providers/ProviderManager'
import { providersManager } from '../config'

/**
 * 注册 Provider 配置相关的 IPC Handlers
 */
export function registerProviderHandlers(providerManager: ProviderManager) {
  // 保存提供商配置（直接使用 Electron Store，立即生效）
  ipcMain.handle('save-provider-config', async (_event, config: any) => {
    await providersManager.saveProviderConfig(config.providerName, config.config, config.enabled)
    // 广播 Provider 配置变更事件到所有窗口
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('provider-config-changed')
    })
  })

  // 获取单个提供商配置（从 Electron Store 读取）
  ipcMain.handle('get-provider-config', async (_event, providerName: string) => {
    return await providersManager.getProviderConfig(providerName)
  })

  // 获取所有提供商配置（从 Electron Store 读取）
  ipcMain.handle('get-all-provider-configs', async () => {
    return await providersManager.getAllProviderConfigs()
  })

  // 验证提供商配置
  ipcMain.handle('validate-provider-config', async (_event, providerName: string, config: any) => {
    const provider = providerManager.getProvider(providerName)
    if (!provider || !provider.validateConfig) {
      return false
    }
    return provider.validateConfig(config)
  })

  // 获取模型列表
  ipcMain.handle('fetch-models', async (_event, providerName: string, apiKey: string) => {
    try {
      let url = ''
      if (providerName === 'openai') {
        url = 'https://api.openai.com/v1/models'
      } else if (providerName === 'deepseek') {
        url = 'https://api.deepseek.com/models'
      } else {
        throw new Error(`Unsupported provider: ${providerName}`)
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const models = data.data || []

      // 保存模型列表到持久化存储
      await providersManager.saveProviderModels(providerName, models)

      return models
    } catch (error) {
      console.error('Failed to fetch models:', error)
      throw error
    }
  })

  // 获取已缓存的模型列表
  ipcMain.handle('get-provider-models', async (_event, providerName: string) => {
    return await providersManager.getProviderModels(providerName)
  })

  console.log('[IPC] Provider handlers registered')
}
