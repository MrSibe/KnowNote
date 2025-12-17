import { ipcMain, BrowserWindow } from 'electron'
import { ProviderManager } from '../providers/ProviderManager'
import { providersManager } from '../config'
import { enrichModelsWithType } from '../../shared/utils/modelClassifier'
import { ProviderSchemas, validate } from './validation'

/**
 * 注册 Provider 配置相关的 IPC Handlers
 */
export function registerProviderHandlers(providerManager: ProviderManager) {
  // 保存提供商配置（直接使用 Electron Store，立即生效）（带参数验证）
  ipcMain.handle(
    'save-provider-config',
    validate(ProviderSchemas.saveProviderConfig, async (args) => {
      await providersManager.saveProviderConfig(args.providerName, args.config, args.enabled)

      // 如果是自定义供应商且刚被启用,注册到 ProviderManager
      if (args.enabled && !providerManager.getDescriptor(args.providerName)) {
        // 这是一个新的自定义供应商,需要注册
        const customConfig = {
          providerName: args.providerName,
          displayName: args.config.displayName || args.providerName,
          baseUrl: args.config.baseUrl || '',
          apiKey: args.config.apiKey || ''
        }

        if (customConfig.baseUrl) {
          await providerManager.registerCustomProvider(customConfig)
        }
      }

      // 广播 Provider 配置变更事件到所有窗口
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send('provider-config-changed')
      })
    })
  )

  // 获取单个提供商配置（从 Electron Store 读取）（带参数验证）
  ipcMain.handle(
    'get-provider-config',
    validate(ProviderSchemas.getProviderConfig, async (args) => {
      return await providersManager.getProviderConfig(args.providerName)
    })
  )

  // 获取所有提供商配置（从 Electron Store 读取）
  ipcMain.handle('get-all-provider-configs', async () => {
    return await providersManager.getAllProviderConfigs()
  })

  // 删除提供商配置（带参数验证）
  ipcMain.handle(
    'delete-provider-config',
    validate(ProviderSchemas.deleteProviderConfig, async (args) => {
      await providersManager.deleteProviderConfig(args.providerName)
      // 广播 Provider 配置变更事件到所有窗口
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send('provider-config-changed')
      })
    })
  )

  // 验证提供商配置（带参数验证）
  ipcMain.handle(
    'validate-provider-config',
    validate(ProviderSchemas.validateProviderConfig, async (args) => {
      const provider = providerManager.getProvider(args.providerName)
      if (!provider || !provider.validateConfig) {
        return false
      }
      return provider.validateConfig(args.config)
    })
  )

  // 获取模型列表（带参数验证）
  ipcMain.handle(
    'fetch-models',
    validate(ProviderSchemas.fetchModels, async (args) => {
      try {
        let url = ''

        // 内置供应商使用硬编码的 URL
        if (args.providerName === 'openai') {
          url = 'https://api.openai.com/v1/models'
        } else if (args.providerName === 'deepseek') {
          url = 'https://api.deepseek.com/models'
        } else if (args.providerName === 'siliconflow') {
          url = 'https://api.siliconflow.cn/v1/models'
        } else if (args.providerName === 'qwen') {
          url = 'https://dashscope.aliyuncs.com/compatible-mode/v1/models'
        } else if (args.providerName === 'kimi') {
          url = 'https://api.moonshot.cn/v1/models'
        } else {
          // 自定义供应商：从配置中获取 baseUrl
          const providerConfig = await providersManager.getProviderConfig(args.providerName)
          if (!providerConfig || !providerConfig.config.baseUrl) {
            throw new Error(`Custom provider ${args.providerName} has no baseUrl configured`)
          }
          const baseUrl = providerConfig.config.baseUrl
          url = baseUrl.endsWith('/') ? `${baseUrl}models` : `${baseUrl}/models`
        }

        const headers: Record<string, string> = {
          Accept: 'application/json',
          Authorization: `Bearer ${args.apiKey}`
        }

        const response = await fetch(url, {
          method: 'GET',
          headers
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        const rawModels = data.data || data.models || []

        // 为模型添加类型信息
        const modelsWithType = enrichModelsWithType(rawModels)

        // 保存带类型的模型列表到持久化存储
        await providersManager.saveProviderModels(args.providerName, modelsWithType)

        return modelsWithType
      } catch (error) {
        console.error('Failed to fetch models:', error)
        throw error
      }
    })
  )

  // 获取已缓存的模型列表（带参数验证）
  ipcMain.handle(
    'get-provider-models',
    validate(ProviderSchemas.getProviderModels, async (args) => {
      return await providersManager.getProviderModels(args.providerName)
    })
  )

  console.log('[IPC] Provider handlers registered')
}
