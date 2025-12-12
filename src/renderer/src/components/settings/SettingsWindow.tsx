import { Globe, Database, HelpCircle, Check, X } from 'lucide-react'
import { useState, useEffect, useMemo, ReactElement } from 'react'
import GeneralSettings from './GeneralSettings'
import ProvidersSettings from './ProvidersSettings'
import AboutSettings from './AboutSettings'

interface AppSettings {
  theme: 'light' | 'dark'
  language: 'zh-CN' | 'en-US' | 'ja-JP'
  autoLaunch: boolean
  defaultModel?: string
}

interface ProviderConfig {
  providerName: string
  config: Record<string, any>
  enabled: boolean
  updatedAt: number
}

export default function SettingsWindow(): ReactElement {
  const [activeSection, setActiveSection] = useState<string>('general')
  const [originalSettings, setOriginalSettings] = useState<AppSettings | null>(null)
  const [pendingSettings, setPendingSettings] = useState<AppSettings | null>(null)
  const [originalProviders, setOriginalProviders] = useState<ProviderConfig[]>([])
  const [pendingProviders, setPendingProviders] = useState<ProviderConfig[]>([])

  // 加载初始设置
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await window.api.settings.getAll()
      setOriginalSettings(settings)
      setPendingSettings(settings)

      const providers = await window.api.getAllProviderConfigs()
      setOriginalProviders(providers)
      setPendingProviders(providers)
    }
    loadSettings()
  }, [])

  // 使用 useMemo 计算是否有变化
  const hasChanges = useMemo(() => {
    if (originalSettings && pendingSettings && originalProviders && pendingProviders) {
      const settingsChanged = JSON.stringify(originalSettings) !== JSON.stringify(pendingSettings)
      const providersChanged =
        JSON.stringify(originalProviders) !== JSON.stringify(pendingProviders)
      return settingsChanged || providersChanged
    }
    return false
  }, [originalSettings, pendingSettings, originalProviders, pendingProviders])

  const menuItems = [
    {
      id: 'general',
      icon: Globe,
      label: '通用'
    },
    {
      id: 'provider',
      icon: Database,
      label: '提供商'
    },
    {
      id: 'about',
      icon: HelpCircle,
      label: '关于'
    }
  ]

  // 更新临时设置
  const updatePendingSettings = (updates: Partial<AppSettings>) => {
    if (pendingSettings) {
      setPendingSettings({ ...pendingSettings, ...updates })
    }
  }

  // 更新临时提供商配置
  const updatePendingProviders = (updatedProviders: ProviderConfig[]) => {
    setPendingProviders(updatedProviders)
  }

  // 确认保存
  const handleConfirm = async () => {
    // 保存通用设置
    if (pendingSettings) {
      await window.api.settings.update(pendingSettings)
      setOriginalSettings(pendingSettings)
    }

    // 保存提供商配置
    for (const provider of pendingProviders) {
      await window.api.saveProviderConfig(provider)
    }
    setOriginalProviders(pendingProviders)
  }

  // 取消变更
  const handleCancel = () => {
    if (originalSettings) {
      setPendingSettings(originalSettings)
    }
    if (originalProviders) {
      setPendingProviders(originalProviders)
    }
  }

  const renderContent = (): ReactElement | null => {
    if (!pendingSettings) return null

    switch (activeSection) {
      case 'general':
        return (
          <GeneralSettings
            settings={pendingSettings}
            onSettingsChange={updatePendingSettings}
            providers={pendingProviders}
          />
        )
      case 'provider':
        return (
          <ProvidersSettings
            providers={pendingProviders}
            onProvidersChange={updatePendingProviders}
          />
        )
      case 'about':
        return <AboutSettings />
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* 顶部可拖拽标题栏 */}
      <div
        className="absolute top-0 left-0 right-0 h-10 z-10 flex items-center justify-center bg-background"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <span className="text-sm text-muted-foreground font-medium">设置</span>
      </div>

      {/* Island风格布局容器 */}
      <div className="flex w-full h-full pt-10 px-3 pb-3 gap-3">
        {/* 左侧菜单 - Island */}
        <div className="w-48 min-w-[12rem] bg-card rounded-xl p-4 flex flex-col">
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    activeSection === item.id
                      ? 'bg-accent text-foreground'
                      : 'hover:bg-accent/50 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 右侧内容区域 */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* 设置内容 - Island */}
          <div className="flex-1 bg-card rounded-xl">
            <div className="h-full overflow-y-auto p-6">
              <div className="w-full">{renderContent()}</div>
            </div>
          </div>

          {/* 底部操作按钮 - Island */}
          <div className="bg-card rounded-xl p-4">
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleCancel}
                disabled={!hasChanges}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  hasChanges
                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer'
                    : 'bg-secondary/50 text-secondary-foreground/50 cursor-not-allowed'
                }`}
              >
                <X className="w-4 h-4" />
                <span className="text-sm font-medium">取消</span>
              </button>
              <button
                onClick={handleConfirm}
                disabled={!hasChanges}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  hasChanges
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-sm'
                    : 'bg-primary/50 text-primary-foreground/50 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">保存</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
