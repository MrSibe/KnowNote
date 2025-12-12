import { useState, ReactElement } from 'react'
import { Search, Eye, EyeOff, ExternalLink, Download, Loader2 } from 'lucide-react'

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
  const [showApiKey, setShowApiKey] = useState(false)
  const [models, setModels] = useState<Record<string, Model[]>>({})
  const [fetchingModels, setFetchingModels] = useState<Record<string, boolean>>({})
  const [modelSearchQuery, setModelSearchQuery] = useState('')

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
      enabled: deepseekProvider.enabled
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'OpenAI GPT models including GPT-4 and GPT-3.5',
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
        <button className="w-full py-3 bg-primary hover:bg-primary/90 rounded-xl text-sm font-medium transition-colors">
          Add Custom Provider
        </button>
      </div>

      {/* 右侧配置区域 */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {activeProvider === 'deepseek' && (
          <div className="flex flex-col gap-4 w-full">
            {/* 顶部标题和开关 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-foreground">DeepSeek</h2>
                {deepseekProvider.enabled && (
                  <span className="px-2.5 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded-full border border-primary/30">
                    Active
                  </span>
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={deepseekProvider.enabled}
                  onChange={(e) => updateProviderConfig('deepseek', { enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* 描述 */}
            <p className="text-muted-foreground text-sm -mt-1">
              DeepSeek AI models with reasoning capabilities
            </p>

            {/* API Key */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-foreground">API Key</h3>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={deepseekProvider.config.apiKey || ''}
                  onChange={(e) =>
                    updateProviderConfig('deepseek', {
                      config: { ...deepseekProvider.config, apiKey: e.target.value }
                    })
                  }
                  placeholder="sk-..."
                  className="w-full px-3 py-2 bg-muted rounded-lg text-sm text-foreground placeholder-muted-foreground outline-none border border-border focus:ring-2 focus:ring-inset focus:ring-ring pr-12"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted/50 rounded-md transition-colors"
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>Get your API key from</span>
                <a
                  href="https://platform.deepseek.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 inline-flex items-center gap-1"
                >
                  DeepSeek Platform
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Models */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">Models</h3>
                <button
                  onClick={() => fetchModels('deepseek')}
                  disabled={fetchingModels.deepseek}
                  className="flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 disabled:bg-secondary/50 text-secondary-foreground text-xs rounded-lg transition-colors"
                >
                  {fetchingModels.deepseek ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>获取中...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3" />
                      <span>Fetch Models</span>
                    </>
                  )}
                </button>
              </div>

              {models.deepseek && models.deepseek.length > 0 && (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="搜索模型..."
                      value={modelSearchQuery}
                      onChange={(e) => setModelSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-muted rounded-lg text-sm text-foreground placeholder-muted-foreground outline-none border border-border focus:ring-2 focus:ring-inset focus:ring-ring"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 border border-border rounded-lg p-2">
                    <p className="text-xs text-muted-foreground px-2 py-1">
                      共 {models.deepseek.length} 个模型
                    </p>
                    {models.deepseek
                      .filter((model) =>
                        model.id.toLowerCase().includes(modelSearchQuery.toLowerCase())
                      )
                      .map((model) => (
                        <label
                          key={model.id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={deepseekProvider.config.models?.includes(model.id) || false}
                            onChange={(e) => {
                              const currentModels = deepseekProvider.config.models || []
                              const newModels = e.target.checked
                                ? [...currentModels, model.id]
                                : currentModels.filter((m: string) => m !== model.id)
                              updateProviderConfig('deepseek', {
                                config: { ...deepseekProvider.config, models: newModels }
                              })
                            }}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring focus:ring-offset-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">
                              {model.id}
                            </div>
                            {model.owned_by && (
                              <div className="text-xs text-muted-foreground">
                                by {model.owned_by}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeProvider === 'openai' && (
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-foreground">OpenAI</h2>
                {openaiProvider.enabled && (
                  <span className="px-2.5 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded-full border border-primary/30">
                    Active
                  </span>
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={openaiProvider.enabled}
                  onChange={(e) => updateProviderConfig('openai', { enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <p className="text-muted-foreground text-sm -mt-1">
              OpenAI GPT models including GPT-4 and GPT-3.5
            </p>

            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-foreground">API Key</h3>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={openaiProvider.config.apiKey || ''}
                  onChange={(e) =>
                    updateProviderConfig('openai', {
                      config: { ...openaiProvider.config, apiKey: e.target.value }
                    })
                  }
                  placeholder="sk-..."
                  className="w-full px-3 py-2 bg-muted rounded-lg text-sm text-foreground placeholder-muted-foreground outline-none border border-border focus:ring-2 focus:ring-inset focus:ring-ring pr-12"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted/50 rounded-md transition-colors"
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>Get your API key from</span>
                <a
                  href="https://platform.openai.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 inline-flex items-center gap-1"
                >
                  OpenAI Platform
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Models */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">Models</h3>
                <button
                  onClick={() => fetchModels('openai')}
                  disabled={fetchingModels.openai}
                  className="flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 disabled:bg-secondary/50 text-secondary-foreground text-xs rounded-lg transition-colors"
                >
                  {fetchingModels.openai ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>获取中...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3" />
                      <span>Fetch Models</span>
                    </>
                  )}
                </button>
              </div>

              {models.openai && models.openai.length > 0 && (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="搜索模型..."
                      value={modelSearchQuery}
                      onChange={(e) => setModelSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-muted rounded-lg text-sm text-foreground placeholder-muted-foreground outline-none border border-border focus:ring-2 focus:ring-inset focus:ring-ring"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 border border-border rounded-lg p-2">
                    <p className="text-xs text-muted-foreground px-2 py-1">
                      共 {models.openai.length} 个模型
                    </p>
                    {models.openai
                      .filter((model) =>
                        model.id.toLowerCase().includes(modelSearchQuery.toLowerCase())
                      )
                      .map((model) => (
                        <label
                          key={model.id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={openaiProvider.config.models?.includes(model.id) || false}
                            onChange={(e) => {
                              const currentModels = openaiProvider.config.models || []
                              const newModels = e.target.checked
                                ? [...currentModels, model.id]
                                : currentModels.filter((m: string) => m !== model.id)
                              updateProviderConfig('openai', {
                                config: { ...openaiProvider.config, models: newModels }
                              })
                            }}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring focus:ring-offset-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">
                              {model.id}
                            </div>
                            {model.owned_by && (
                              <div className="text-xs text-muted-foreground">
                                by {model.owned_by}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
