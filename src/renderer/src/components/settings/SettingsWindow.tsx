import { Globe, Database, HelpCircle, MessageSquare } from 'lucide-react'
import { useState, useEffect, useMemo, ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import GeneralSettings from './GeneralSettings'
import ProvidersSettings from './ProvidersSettings'
import PromptsSettings from './PromptsSettings'
import AboutSettings from './AboutSettings'
import SettingsActionBar from './SettingsActionBar'
import { ScrollArea } from '../ui/scroll-area'
import { Button } from '../ui/button'
import type { AppSettings } from '../../../../shared/types'

interface ProviderConfig {
  providerName: string
  config: Record<string, any>
  enabled: boolean
  updatedAt: number
}

export default function SettingsWindow(): ReactElement {
  const { t } = useTranslation('settings')
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
      label: t('generalSettings')
    },
    {
      id: 'provider',
      icon: Database,
      label: t('aiProviders')
    },
    {
      id: 'prompts',
      icon: MessageSquare,
      label: t('promptSettings')
    },
    {
      id: 'about',
      icon: HelpCircle,
      label: t('about')
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

  // 刷新提供商配置（用于新增/删除后同步状态）
  const refreshProviders = async () => {
    const providers = await window.api.getAllProviderConfigs()
    setOriginalProviders(providers)
    setPendingProviders(providers)
  }

  // 确认保存
  const handleConfirm = async () => {
    // 保存通用设置
    if (pendingSettings) {
      await window.api.settings.update(pendingSettings)
      setOriginalSettings(pendingSettings)
    }

    // 保存提供商配置（新增/删除已经立即保存，这里只保存修改）
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
            onRefresh={refreshProviders}
          />
        )
      case 'prompts':
        return (
          <PromptsSettings settings={pendingSettings} onSettingsChange={updatePendingSettings} />
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
        <span className="text-sm text-muted-foreground font-medium">{t('settings')}</span>
      </div>

      {/* Island风格布局容器 */}
      <div className="flex w-full h-full pt-10 px-3 pb-3 gap-3">
        {/* 左侧菜单 - Island */}
        <div className="w-48 min-w-48 bg-card rounded-xl p-4 flex flex-col shadow-md">
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  variant="ghost"
                  className={`w-full p-3 rounded-lg justify-start h-auto ${
                    activeSection === item.id
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                </Button>
              )
            })}
          </div>
        </div>

        {/* 右侧内容区域 */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* 设置内容 - Island */}
          <div className="flex-1 min-h-0 bg-card rounded-xl overflow-hidden shadow-md">
            <ScrollArea className="h-full">
              <div className="p-6">{renderContent()}</div>
            </ScrollArea>
          </div>

          {/* 底部操作按钮 - Island */}
          <SettingsActionBar
            hasChanges={hasChanges}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
          />
        </div>
      </div>
    </div>
  )
}
