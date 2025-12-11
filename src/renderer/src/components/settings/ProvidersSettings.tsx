import { useState, useEffect, ReactElement } from 'react'
import { Search, Eye, EyeOff, ExternalLink } from 'lucide-react'

interface LLMConfig {
  apiKey?: string
  baseUrl?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export default function ProvidersSettings(): ReactElement {
  const [activeProvider, setActiveProvider] = useState<string>('deepseek')
  const [searchQuery, setSearchQuery] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)

  const [openaiConfig, setOpenaiConfig] = useState<LLMConfig>({
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048
  })
  const [deepseekConfig, setDeepseekConfig] = useState<LLMConfig>({
    apiKey: '',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 4096
  })

  const [openaiEnabled, setOpenaiEnabled] = useState(false)
  // const [ollamaEnabled] = useState(false)
  const [deepseekEnabled, setDeepseekEnabled] = useState(true)

  // 加载配置
  useEffect(() => {
    const loadConfigs = async (): Promise<void> => {
      try {
        const openai = await window.api.getProviderConfig('openai')
        if (openai) {
          setOpenaiConfig(openai.config)
          setOpenaiEnabled(openai.enabled)
        }
      } catch (error) {
        console.error('Failed to load provider configs:', error)
      }
    }
    loadConfigs()
  }, [])

  const providers = [
    {
      id: 'deepseek',
      name: 'DeepSeek',
      description: 'DeepSeek AI models with reasoning capabilities',
      enabled: deepseekEnabled
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'OpenAI GPT models including GPT-4 and GPT-3.5',
      enabled: openaiEnabled
    }
  ]

  const filteredProviders = providers.filter((provider) =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-full gap-6">
      {/* 左侧供应商列表 */}
      <div className="w-48 flex-shrink-0 flex flex-col gap-4">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="搜索提供商..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#2a2a2a] rounded-lg text-sm text-gray-100 placeholder-gray-500 outline-none border border-gray-700/50 focus:border-gray-600"
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
                  ? 'bg-[#2a2a2a] border border-blue-500/50'
                  : 'bg-transparent border border-gray-700/30 hover:border-gray-600/50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-100">{provider.name}</div>
              </div>
              <div
                className={`w-2 h-2 rounded-full ${provider.enabled ? 'bg-blue-500' : 'bg-gray-600'}`}
              ></div>
            </button>
          ))}
        </div>

        {/* 添加自定义提供商按钮 */}
        <button className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-sm font-medium transition-colors">
          Add Custom Provider
        </button>
      </div>

      {/* 右侧配置区域 */}
      <div className="flex-1 min-w-[400px] overflow-y-auto">
        {activeProvider === 'deepseek' && (
          <div className="flex flex-col gap-4">
            {/* 顶部标题和开关 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-100">DeepSeek</h2>
                <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
                  Active
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={deepseekEnabled}
                  onChange={(e) => setDeepseekEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            {/* 描述 */}
            <p className="text-gray-400 text-sm -mt-1">
              DeepSeek AI models with reasoning capabilities
            </p>

            {/* API Key */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-gray-100">API Key</h3>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={deepseekConfig.apiKey}
                  onChange={(e) => setDeepseekConfig({ ...deepseekConfig, apiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 bg-[#2a2a2a] rounded-lg text-sm text-gray-100 placeholder-gray-500 outline-none border border-gray-700/50 focus:border-gray-600 pr-10"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-700/50 rounded-md transition-colors"
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <span>Get your API key from</span>
                <a
                  href="https://platform.deepseek.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                >
                  DeepSeek Platform
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Models */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-100">Models</h3>
                <button className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-gray-700 rounded-md text-xs font-medium text-gray-100 transition-colors inline-flex items-center gap-1.5">
                  <span>↓</span>
                  Fetch
                </button>
              </div>

              {/* 模型搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search models..."
                  className="w-full pl-9 pr-3 py-2 bg-[#2a2a2a] rounded-lg text-sm text-gray-100 placeholder-gray-500 outline-none border border-gray-700/50 focus:border-gray-600"
                />
              </div>

              {/* 模型统计信息 */}
              <p className="text-xs text-gray-400">
                Showing 2 of 2 models (enabled models shown first)
              </p>

              {/* 模型列表 */}
              <div className="flex flex-col gap-2">
                {/* deepseek-chat */}
                <div className="p-3 bg-[#2a2a2a] rounded-lg border border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-medium text-gray-100">deepseek-chat</h4>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            128K
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">deepseek-chat</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>

                {/* deepseek-reasoner */}
                <div className="p-3 bg-[#2a2a2a] rounded-lg border border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-medium text-gray-100">deepseek-reasoner</h4>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                            128K
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">deepseek-reasoner</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeProvider === 'openai' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-100">OpenAI</h2>
                {openaiEnabled && (
                  <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
                    Active
                  </span>
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={openaiEnabled}
                  onChange={(e) => setOpenaiEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            <p className="text-gray-400 text-sm -mt-1">
              OpenAI GPT models including GPT-4 and GPT-3.5
            </p>

            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-gray-100">API Key</h3>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={openaiConfig.apiKey}
                  onChange={(e) => setOpenaiConfig({ ...openaiConfig, apiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 bg-[#2a2a2a] rounded-lg text-sm text-gray-100 placeholder-gray-500 outline-none border border-gray-700/50 focus:border-gray-600 pr-10"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-700/50 rounded-md transition-colors"
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <span>Get your API key from</span>
                <a
                  href="https://platform.openai.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                >
                  OpenAI Platform
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {(activeProvider === 'anthropic' ||
          activeProvider === 'google' ||
          activeProvider === 'ollama') && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="text-6xl opacity-20">🚧</div>
              <h3 className="text-xl font-medium text-gray-300">Coming Soon</h3>
              <p className="text-gray-500 text-sm">
                {activeProvider === 'anthropic' && 'Anthropic Claude 配置即将推出'}
                {activeProvider === 'google' && 'Google Gemini 配置即将推出'}
                {activeProvider === 'ollama' && 'OpenRouter 配置即将推出'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
