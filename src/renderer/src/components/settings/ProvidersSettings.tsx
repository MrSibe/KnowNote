import { useState } from 'react'

export default function ProvidersSettings() {
  const [activeProvider, setActiveProvider] = useState<string>('openai')

  const providers = [
    {
      id: 'openai',
      name: 'OpenAI',
      icon: '🤖',
      color: 'from-green-400 to-green-600',
      enabled: true
    },
    {
      id: 'deepseek',
      name: 'DeepSeek',
      icon: '🔵',
      color: 'from-blue-400 to-blue-600',
      enabled: false
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      icon: '🤖',
      color: 'from-purple-400 to-purple-600',
      enabled: false
    },
    {
      id: 'google',
      name: 'Google',
      icon: '🔍',
      color: 'from-blue-400 to-blue-500',
      enabled: false
    }
  ]

  return (
    <div className="flex h-full">
      {/* 左侧供应商列表 */}
      <div className="w-48 min-w-[12rem] border-r border-gray-800/50 p-4 pt-16">
        <h3 className="text-sm font-medium text-gray-300 mb-4">AI 供应商</h3>
        <div className="space-y-2">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setActiveProvider(provider.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                activeProvider === provider.id
                  ? 'bg-[#2a2a2a] text-gray-100'
                  : 'bg-[#171717] hover:bg-[#2a2a2a] text-gray-300'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${provider.color} ${
                  provider.enabled ? '' : 'opacity-50'
                }`}
              >
                <span className="text-white font-bold text-sm">{provider.icon}</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-100">{provider.name}</div>
                <div className="text-xs text-gray-400">
                  {provider.enabled ? '已启用' : '未启用'}
                </div>
              </div>
              {provider.enabled && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
            </button>
          ))}
        </div>
      </div>

      {/* 右侧配置区域 */}
      <div className="flex-1 min-w-[400px] overflow-y-auto p-6 pt-16">
        {activeProvider === 'openai' && (
          <div className="max-w-4xl">
            <h3 className="text-lg font-medium mb-4 text-gray-100">OpenAI 配置</h3>

            <div className="space-y-4">
              <div className="p-4 bg-[#171717] rounded-xl">
                <h4 className="text-sm font-medium mb-3 text-gray-100">API 密钥</h4>
                <div className="p-3 bg-[#0a0a0a] rounded-lg border border-gray-700">
                  <input
                    type="password"
                    placeholder="sk-..."
                    className="w-full bg-transparent outline-none text-gray-100 placeholder-gray-500"
                  />
                </div>
                <button className="mt-2 text-xs text-blue-400 hover:text-blue-300">
                  验证密钥
                </button>
              </div>

              <div className="p-4 bg-[#171717] rounded-xl">
                <h4 className="text-sm font-medium mb-3 text-gray-100">模型设置</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1">默认模型</label>
                    <select className="w-full p-2 bg-[#0a0a0a] rounded-lg text-sm border border-gray-700 text-gray-100">
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1">温度 (0.0-2.0)</label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      defaultValue="0.7"
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">当前: 0.7</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1">最大令牌数</label>
                    <input
                      type="number"
                      min="1"
                      max="4096"
                      defaultValue="2048"
                      className="w-full p-2 bg-[#0a0a0a] rounded-lg text-sm border border-gray-700 text-gray-100"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#171717] rounded-xl">
                <h4 className="text-sm font-medium mb-3 text-gray-100">使用限制</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">每分钟请求数</span>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      defaultValue="3"
                      className="w-20 px-2 py-1.5 bg-[#0a0a0a] rounded-lg text-sm border border-gray-700 text-gray-100 text-center"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">每日限制</span>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      defaultValue="200"
                      className="w-20 px-2 py-1.5 bg-[#0a0a0a] rounded-lg text-sm border border-gray-700 text-gray-100 text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeProvider === 'deepseek' && (
          <div className="max-w-4xl">
            <div className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-xl border border-blue-400/20">
              <h4 className="text-lg font-medium mb-2 text-gray-100">DeepSeek 已开放</h4>
              <p className="text-sm text-gray-300 mb-4">
                支持深度思考、代码生成、数学推理等功能
              </p>
            </div>

            <div className="space-y-4 mt-6">
              <div className="p-4 bg-[#171717] rounded-xl">
                <h4 className="text-sm font-medium mb-3 text-gray-100">API 密钥</h4>
                <div className="p-3 bg-[#0a0a0a] rounded-lg border border-gray-700">
                  <input
                    type="password"
                    placeholder="sk-..."
                    className="w-full bg-transparent outline-none text-gray-100 placeholder-gray-500"
                  />
                </div>
                <button className="mt-2 text-xs text-blue-400 hover:text-blue-300">
                  验证密钥
                </button>
              </div>

              <div className="p-4 bg-[#171717] rounded-xl">
                <h4 className="text-sm font-medium mb-3 text-gray-100">可用模型</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 bg-[#0a0a0a] rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="text-sm font-medium text-gray-100">DeepSeek-Chat</div>
                    <div className="text-xs text-gray-400">对话模型</div>
                  </button>
                  <button className="p-3 bg-[#0a0a0a] rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="text-sm font-medium text-gray-100">DeepSeek-Coder</div>
                    <div className="text-xs text-gray-400">代码模型</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!['openai', 'deepseek'].includes(activeProvider) && (
          <div className="max-w-4xl">
            <div className="text-center py-16">
              <div className="text-gray-400 text-lg mb-4">该供应商暂未配置</div>
              <p className="text-sm text-gray-500">请选择左侧已启用的供应商进行配置</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
