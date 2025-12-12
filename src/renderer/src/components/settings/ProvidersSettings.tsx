import { useState, ReactElement } from 'react'
import { Search } from 'lucide-react'
import ProviderConfigPanel from './ProviderConfigPanel'
import { ScrollArea } from '../ui/scroll-area'

interface ProviderConfig {
  providerName: string
  config: Record<string, any>
  enabled: boolean
  updatedAt: number
}

interface ProvidersSettingsProps {
  providers: ProviderConfig[]
  onProvidersChange: (updatedProviders: ProviderConfig[]) => void
}

interface Model {
  id: string
  object: string
  owned_by?: string
  created?: number
}

export default function ProvidersSettings({
  providers,
  onProvidersChange
}: ProvidersSettingsProps): ReactElement {
  const [activeProvider, setActiveProvider] = useState<string>('deepseek')
  const [searchQuery, setSearchQuery] = useState('')
  const [models, setModels] = useState<Record<string, Model[]>>({})
  const [fetchingModels, setFetchingModels] = useState<Record<string, boolean>>({})

  // 获取特定提供商的配置
  const getProviderConfig = (providerName: string) => {
    return (
      providers.find((p) => p.providerName === providerName) || {
        providerName,
        config: {},
        enabled: false,
        updatedAt: 0
      }
    )
  }

  // 更新提供商配置
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
      // 如果不存在，创建新的配置
      updatedProviders.push({
        providerName,
        config: updates.config || {},
        enabled: updates.enabled || false,
        updatedAt: Date.now()
      })
    }

    onProvidersChange(updatedProviders)
  }

  // 获取模型列表
  const fetchModels = async (providerName: string) => {
    const provider = getProviderConfig(providerName)
    const apiKey = provider.config.apiKey

    if (!apiKey) {
      alert('请先输入 API Key')
      return
    }

    setFetchingModels((prev) => ({ ...prev, [providerName]: true }))

    try {
      const modelList = await window.api.fetchModels(providerName, apiKey)
      setModels((prev) => ({ ...prev, [providerName]: modelList }))
    } catch (error) {
      console.error('获取模型列表失败:', error)
      alert(`获取模型列表失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setFetchingModels((prev) => ({ ...prev, [providerName]: false }))
    }
  }

  const openaiProvider = getProviderConfig('openai')
  const deepseekProvider = getProviderConfig('deepseek')

  const providerList = [
    {
      id: 'deepseek',
      name: 'DeepSeek',
      description: 'DeepSeek AI models with reasoning capabilities',
      platformUrl: 'https://platform.deepseek.com',
      enabled: deepseekProvider.enabled
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'OpenAI GPT models including GPT-4 and GPT-3.5',
      platformUrl: 'https://platform.openai.com',
      enabled: openaiProvider.enabled
    }
  ]

  const filteredProviders = providerList.filter((provider) =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-full gap-6 overflow-hidden">
      {/* 左侧供应商列表 */}
      <div className="w-48 flex-shrink-0 flex flex-col gap-4">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索提供商..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-muted rounded-lg text-sm text-foreground placeholder-muted-foreground outline-none border border-border focus:ring-2 focus:ring-inset focus:ring-ring"
          />
        </div>

        {/* 供应商列表 */}
        <div className="flex flex-col gap-2">
          {filteredProviders.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setActiveProvider(provider.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                activeProvider === provider.id
                  ? 'bg-muted border border-primary/50'
                  : 'bg-transparent border border-border/50 hover:border-input'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{provider.name}</div>
              </div>
              <div
                className={`w-2 h-2 rounded-full ${provider.enabled ? 'bg-primary' : 'bg-muted'}`}
              ></div>
            </button>
          ))}
        </div>

        {/* 添加自定义提供商按钮 */}
        <button className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium transition-colors">
          Add Custom Provider
        </button>
      </div>

      {/* 右侧配置区域 */}
      <ScrollArea className="flex-1 min-w-0">
        {activeProvider === 'deepseek' && (
          <ProviderConfigPanel
            displayName="DeepSeek"
            description="DeepSeek AI models with reasoning capabilities"
            platformUrl="https://platform.deepseek.com"
            provider={deepseekProvider}
            models={models.deepseek || []}
            isFetching={fetchingModels.deepseek || false}
            onConfigChange={(config) => updateProviderConfig('deepseek', { config })}
            onEnabledChange={(enabled) => updateProviderConfig('deepseek', { enabled })}
            onFetchModels={() => fetchModels('deepseek')}
          />
        )}

        {activeProvider === 'openai' && (
          <ProviderConfigPanel
            displayName="OpenAI"
            description="OpenAI GPT models including GPT-4 and GPT-3.5"
            platformUrl="https://platform.openai.com"
            provider={openaiProvider}
            models={models.openai || []}
            isFetching={fetchingModels.openai || false}
            onConfigChange={(config) => updateProviderConfig('openai', { config })}
            onEnabledChange={(enabled) => updateProviderConfig('openai', { enabled })}
            onFetchModels={() => fetchModels('openai')}
          />
        )}
      </ScrollArea>
    </div>
  )
}
