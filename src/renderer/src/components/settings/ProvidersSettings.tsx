import { useState, useEffect, ReactElement } from 'react'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ProviderConfigPanel from './ProviderConfigPanel'
import AddProviderDialog from './AddProviderDialog'
import DeleteProviderDialog from './DeleteProviderDialog'
import { ScrollArea } from '../ui/scroll-area'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

interface ProviderConfig {
  providerName: string
  config: Record<string, any>
  enabled: boolean
  updatedAt: number
}

interface ProvidersSettingsProps {
  providers: ProviderConfig[]
  onProvidersChange: (updatedProviders: ProviderConfig[]) => void
  onRefresh: () => Promise<void>
}

interface Model {
  id: string
  object: string
  owned_by?: string
  created?: number
}

export default function ProvidersSettings({
  providers,
  onProvidersChange,
  onRefresh
}: ProvidersSettingsProps): ReactElement {
  const { t } = useTranslation('settings')
  const [activeProvider, setActiveProvider] = useState<string>('deepseek')
  const [searchQuery, setSearchQuery] = useState('')
  const [models, setModels] = useState<Record<string, Model[]>>({})
  const [fetchingModels, setFetchingModels] = useState<Record<string, boolean>>({})
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [providerToDelete, setProviderToDelete] = useState<string>('')

  // 定义每个提供商的默认 baseUrl
  const defaultBaseUrls: Record<string, string> = {
    openai: 'https://api.openai.com/v1',
    deepseek: 'https://api.deepseek.com',
    siliconflow: 'https://api.siliconflow.cn/v1',
    qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    kimi: 'https://api.moonshot.cn/v1'
  }

  // 加载已缓存的模型列表
  useEffect(() => {
    const loadCachedModels = async () => {
      const providerList = ['deepseek', 'openai', 'siliconflow', 'qwen', 'kimi']
      const loadedModels: Record<string, Model[]> = {}

      for (const providerName of providerList) {
        try {
          const cachedModels = await window.api.getProviderModels(providerName)
          loadedModels[providerName] = cachedModels
        } catch (error) {
          console.error(`Failed to load cached models for ${providerName}:`, error)
        }
      }

      setModels(loadedModels)
    }

    loadCachedModels()
  }, [])

  // Get specific provider configuration
  const getProviderConfig = (providerName: string) => {
    const existingProvider = providers.find((p) => p.providerName === providerName)

    if (existingProvider) {
      // 如果提供商存在，但没有设置 baseUrl，则添加默认值
      return {
        ...existingProvider,
        config: {
          ...existingProvider.config,
          baseUrl: existingProvider.config.baseUrl || defaultBaseUrls[providerName] || ''
        }
      }
    }

    // 如果提供商不存在，创建一个带有默认配置的对象
    return {
      providerName,
      config: {
        baseUrl: defaultBaseUrls[providerName] || '',
        apiKey: '',
        models: [],
        displayName: providerName
      },
      enabled: false,
      updatedAt: 0
    }
  }

  // Update provider configuration
  const updateProviderConfig = (
    providerName: string,
    updates: Partial<Pick<ProviderConfig, 'config' | 'enabled'>>
  ) => {
    const updatedProviders = [...providers]
    const index = updatedProviders.findIndex((p) => p.providerName === providerName)

    if (index !== -1) {
      updatedProviders[index] = {
        ...updatedProviders[index],
        ...updates,
        config: updates.config !== undefined ? updates.config : updatedProviders[index].config,
        updatedAt: Date.now()
      }
    } else {
      // If doesn't exist, create new configuration
      updatedProviders.push({
        providerName,
        config: updates.config || {},
        enabled: updates.enabled || false,
        updatedAt: Date.now()
      })
    }

    onProvidersChange(updatedProviders)
  }

  // Fetch model list
  const fetchModels = async (providerName: string) => {
    const provider = getProviderConfig(providerName)
    const apiKey = provider.config.apiKey

    // 检查是否有API Key
    if (!apiKey) {
      alert(t('enterApiKey'))
      return
    }

    setFetchingModels((prev) => ({ ...prev, [providerName]: true }))

    try {
      const modelList = await window.api.fetchModels(providerName, apiKey)
      setModels((prev) => ({ ...prev, [providerName]: modelList }))

      // 保存完整的模型信息到 config，这样 GeneralSettings 可以访问到模型的 type 字段
      updateProviderConfig(providerName, {
        config: {
          ...provider.config,
          modelDetails: modelList
        }
      })
    } catch (error) {
      console.error('Failed to fetch model list:', error)
      alert(`${t('fetchModelFailed')}${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setFetchingModels((prev) => ({ ...prev, [providerName]: false }))
    }
  }

  const openaiProvider = getProviderConfig('openai')
  const deepseekProvider = getProviderConfig('deepseek')
  const siliconflowProvider = getProviderConfig('siliconflow')
  const qwenProvider = getProviderConfig('qwen')
  const kimiProvider = getProviderConfig('kimi')

  const providerList = [
    {
      id: 'deepseek',
      name: t('deepseekName'),
      description: t('deepseekDesc'),
      platformUrl: 'https://platform.deepseek.com',
      enabled: deepseekProvider.enabled
    },
    {
      id: 'openai',
      name: t('openaiName'),
      description: t('openaiDesc'),
      platformUrl: 'https://platform.openai.com',
      enabled: openaiProvider.enabled
    },
    {
      id: 'siliconflow',
      name: t('siliconflowName'),
      description: t('siliconflowDesc'),
      platformUrl: 'https://siliconflow.cn',
      enabled: siliconflowProvider.enabled
    },
    {
      id: 'qwen',
      name: t('qwenName'),
      description: t('qwenDesc'),
      platformUrl: 'https://dashscope.aliyun.com',
      enabled: qwenProvider.enabled
    },
    {
      id: 'kimi',
      name: t('kimiName'),
      description: t('kimiDesc'),
      platformUrl: 'https://platform.moonshot.cn',
      enabled: kimiProvider.enabled
    }
  ]

  // 获取自定义供应商列表
  const getCustomProviders = () => {
    const builtInProviders = ['deepseek', 'openai', 'siliconflow', 'qwen', 'kimi']
    return providers
      .filter((p) => !builtInProviders.includes(p.providerName))
      .map((p) => ({
        id: p.providerName,
        name: p.config.displayName || p.providerName,
        enabled: p.enabled
      }))
  }

  const customProviders = getCustomProviders()

  // 处理添加供应商
  const handleAddProvider = async (data: {
    providerName: string
    apiKey: string
    baseUrl: string
  }) => {
    const newProvider: ProviderConfig = {
      providerName: data.providerName,
      config: {
        apiKey: data.apiKey,
        baseUrl: data.baseUrl,
        displayName: data.providerName,
        models: []
      },
      enabled: false,
      updatedAt: Date.now()
    }

    // 立即保存到后端
    await window.api.saveProviderConfig(newProvider)

    // 刷新状态（同步 original 和 pending）
    await onRefresh()

    // 切换到新供应商
    setActiveProvider(data.providerName)
  }

  // 打开删除确认对话框
  const handleDeleteClick = (providerName: string) => {
    setProviderToDelete(providerName)
    setIsDeleteDialogOpen(true)
  }

  // 确认删除供应商
  const handleDeleteConfirm = async () => {
    // 立即从后端删除
    await window.api.deleteProviderConfig(providerToDelete)

    // 刷新状态（同步 original 和 pending）
    await onRefresh()

    // 如果删除的是当前选中的供应商，切换到 deepseek
    if (activeProvider === providerToDelete) {
      setActiveProvider('deepseek')
    }

    setProviderToDelete('')
  }

  // 自定义供应商模型获取（使用后端 API 避免 CORS 问题）
  const fetchCustomProviderModels = async (providerName: string) => {
    const provider = getProviderConfig(providerName)
    const apiKey = provider.config.apiKey
    const baseUrl = provider.config.baseUrl

    if (!apiKey) {
      alert(t('enterApiKey'))
      return
    }

    if (!baseUrl) {
      alert(t('enterApiKeyAndUrl'))
      return
    }

    // 检查 URL 是否包含非 ASCII 字符
    // eslint-disable-next-line no-control-regex
    if (/[^\x00-\x7F]/.test(baseUrl)) {
      alert(t('apiUrlInvalid'))
      return
    }

    setFetchingModels((prev) => ({ ...prev, [providerName]: true }))

    try {
      // 先将当前配置保存到后端，确保后端能读取到 baseUrl
      await window.api.saveProviderConfig({
        providerName,
        config: provider.config,
        enabled: provider.enabled,
        updatedAt: Date.now()
      })

      // 使用后端 API，后端会从配置中读取 baseUrl
      const modelList = await window.api.fetchModels(providerName, apiKey)
      setModels((prev) => ({ ...prev, [providerName]: modelList }))

      // 保存完整的模型信息到 config
      updateProviderConfig(providerName, {
        config: {
          ...provider.config,
          modelDetails: modelList
        }
      })
    } catch (error) {
      console.error('Failed to fetch model list:', error)
      alert(`${t('fetchModelFailed')}${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setFetchingModels((prev) => ({ ...prev, [providerName]: false }))
    }
  }

  const filteredProviders = providerList.filter((provider) =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-full gap-6 overflow-hidden">
      {/* 左侧供应商列表 */}
      <div className="w-48 shrink-0 flex flex-col gap-4">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
          <Input
            type="text"
            placeholder={t('searchProvider')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* 供应商列表 */}
        <div className="flex flex-col gap-2">
          {/* 内置供应商 */}
          {filteredProviders.map((provider) => (
            <Button
              key={provider.id}
              onClick={() => setActiveProvider(provider.id)}
              variant={activeProvider === provider.id ? 'secondary' : 'outline'}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl justify-start h-auto ${
                activeProvider === provider.id ? 'border-primary/50' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{provider.name}</div>
              </div>
              <div
                className={`w-2 h-2 rounded-full ${provider.enabled ? 'bg-primary' : 'bg-muted'}`}
              ></div>
            </Button>
          ))}

          {/* 分隔线 */}
          {customProviders.length > 0 && <div className="border-t border-border my-2" />}

          {/* 自定义供应商 */}
          {customProviders
            .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((provider) => (
              <Button
                key={provider.id}
                onClick={() => setActiveProvider(provider.id)}
                variant={activeProvider === provider.id ? 'secondary' : 'outline'}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl justify-start h-auto ${
                  activeProvider === provider.id ? 'border-primary/50' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{provider.name}</div>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${provider.enabled ? 'bg-primary' : 'bg-muted'}`}
                />
              </Button>
            ))}
        </div>

        {/* 添加自定义提供商按钮 */}
        <Button
          className="w-full py-3 rounded-xl text-sm font-medium h-auto"
          onClick={() => setIsAddDialogOpen(true)}
        >
          {t('addCustomProvider')}
        </Button>
      </div>

      {/* 右侧配置区域 */}
      <ScrollArea className="flex-1 min-w-0">
        {activeProvider === 'deepseek' && (
          <ProviderConfigPanel
            displayName={t('deepseekName')}
            description={t('deepseekDesc')}
            platformUrl="https://platform.deepseek.com"
            provider={deepseekProvider}
            models={models.deepseek || []}
            isFetching={fetchingModels.deepseek || false}
            onConfigChange={(config) => updateProviderConfig('deepseek', { config })}
            onEnabledChange={(enabled) => updateProviderConfig('deepseek', { enabled })}
            onFetchModels={() => fetchModels('deepseek')}
            defaultBaseUrl={defaultBaseUrls.deepseek}
          />
        )}

        {activeProvider === 'openai' && (
          <ProviderConfigPanel
            displayName={t('openaiName')}
            description={t('openaiDesc')}
            platformUrl="https://platform.openai.com"
            provider={openaiProvider}
            models={models.openai || []}
            isFetching={fetchingModels.openai || false}
            onConfigChange={(config) => updateProviderConfig('openai', { config })}
            onEnabledChange={(enabled) => updateProviderConfig('openai', { enabled })}
            onFetchModels={() => fetchModels('openai')}
            defaultBaseUrl={defaultBaseUrls.openai}
          />
        )}

        {activeProvider === 'siliconflow' && (
          <ProviderConfigPanel
            displayName={t('siliconflowName')}
            description={t('siliconflowDesc')}
            platformUrl="https://siliconflow.cn"
            provider={siliconflowProvider}
            models={models.siliconflow || []}
            isFetching={fetchingModels.siliconflow || false}
            onConfigChange={(config) => updateProviderConfig('siliconflow', { config })}
            onEnabledChange={(enabled) => updateProviderConfig('siliconflow', { enabled })}
            onFetchModels={() => fetchModels('siliconflow')}
            defaultBaseUrl={defaultBaseUrls.siliconflow}
          />
        )}

        {activeProvider === 'qwen' && (
          <ProviderConfigPanel
            displayName={t('qwenName')}
            description={t('qwenDesc')}
            platformUrl="https://dashscope.aliyun.com"
            provider={qwenProvider}
            models={models.qwen || []}
            isFetching={fetchingModels.qwen || false}
            onConfigChange={(config) => updateProviderConfig('qwen', { config })}
            onEnabledChange={(enabled) => updateProviderConfig('qwen', { enabled })}
            onFetchModels={() => fetchModels('qwen')}
            defaultBaseUrl={defaultBaseUrls.qwen}
          />
        )}

        {activeProvider === 'kimi' && (
          <ProviderConfigPanel
            displayName={t('kimiName')}
            description={t('kimiDesc')}
            platformUrl="https://platform.moonshot.cn"
            provider={kimiProvider}
            models={models.kimi || []}
            isFetching={fetchingModels.kimi || false}
            onConfigChange={(config) => updateProviderConfig('kimi', { config })}
            onEnabledChange={(enabled) => updateProviderConfig('kimi', { enabled })}
            onFetchModels={() => fetchModels('kimi')}
            defaultBaseUrl={defaultBaseUrls.kimi}
          />
        )}

        {/* 自定义供应商配置 */}
        {!['deepseek', 'openai', 'siliconflow', 'qwen', 'kimi'].includes(activeProvider) &&
          (() => {
            const customProvider = getProviderConfig(activeProvider)
            return customProvider && customProvider.providerName ? (
              <ProviderConfigPanel
                displayName={customProvider.config.displayName || activeProvider}
                description={t('customProviderDesc')}
                platformUrl={customProvider.config.baseUrl || ''}
                provider={customProvider}
                models={models[activeProvider] || []}
                isFetching={fetchingModels[activeProvider] || false}
                onConfigChange={(config) => updateProviderConfig(activeProvider, { config })}
                onEnabledChange={(enabled) => updateProviderConfig(activeProvider, { enabled })}
                onFetchModels={() => fetchCustomProviderModels(activeProvider)}
                onDelete={() => handleDeleteClick(activeProvider)}
              />
            ) : null
          })()}
      </ScrollArea>

      {/* 添加供应商对话框 */}
      <AddProviderDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onConfirm={handleAddProvider}
        existingProviders={[...providerList.map((p) => p.id), ...customProviders.map((p) => p.id)]}
      />

      {/* 删除供应商对话框 */}
      <DeleteProviderDialog
        isOpen={isDeleteDialogOpen}
        providerName={providerToDelete}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
