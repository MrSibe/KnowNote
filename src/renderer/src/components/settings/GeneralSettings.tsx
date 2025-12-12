import { ReactElement, useEffect, useState, useMemo } from 'react'
import { Sun, Moon, ChevronDown } from 'lucide-react'
import SettingItem from './SettingItem'

interface AppSettings {
  theme: 'light' | 'dark'
  language: 'zh-CN' | 'en-US'
  autoLaunch: boolean
  defaultModel?: string
}

interface ProviderConfig {
  providerName: string
  config: Record<string, any>
  enabled: boolean
  updatedAt: number
}

interface GeneralSettingsProps {
  settings: AppSettings
  onSettingsChange: (updates: Partial<AppSettings>) => void
  providers: ProviderConfig[]
}

const languages = [
  { value: 'zh-CN', label: 'Chinese', native: '简体中文' },
  { value: 'en-US', label: 'English', native: 'English' }
]

export default function GeneralSettings({
  settings,
  onSettingsChange,
  providers
}: GeneralSettingsProps): ReactElement {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false)
  const currentLanguage = languages.find((lang) => lang.value === settings.language) || languages[0]

  // 获取所有启用的供应商的已选模型
  const availableModels = useMemo(() => {
    const models: Array<{ id: string; provider: string; label: string }> = []

    providers.forEach((provider) => {
      if (provider.enabled && provider.config.models && Array.isArray(provider.config.models)) {
        provider.config.models.forEach((modelId: string) => {
          models.push({
            id: `${provider.providerName}:${modelId}`,
            provider: provider.providerName,
            label: modelId
          })
        })
      }
    })

    return models
  }, [providers])

  const currentModel =
    availableModels.find((model) => model.id === settings.defaultModel) || availableModels[0]

  // 当主题变化时，立即更新 DOM 以预览效果
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.theme])

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.language-dropdown')) {
        setIsDropdownOpen(false)
      }
      if (!target.closest('.model-dropdown')) {
        setIsModelDropdownOpen(false)
      }
    }

    if (isDropdownOpen || isModelDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isDropdownOpen, isModelDropdownOpen])

  return (
    <div className="max-w-2xl flex flex-col gap-4">
      {/* 主题模式设置 */}
      <SettingItem title="主题模式" description="选择应用的外观主题">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSettingsChange({ theme: 'light' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              settings.theme === 'light'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">浅色</span>
          </button>
          <button
            onClick={() => onSettingsChange({ theme: 'dark' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              settings.theme === 'dark'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">深色</span>
          </button>
        </div>
      </SettingItem>

      {/* 开机自启动设置 */}
      <SettingItem title="开机自启动" description="系统启动时自动运行应用">
        <button
          onClick={() => onSettingsChange({ autoLaunch: !settings.autoLaunch })}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 ${
            settings.autoLaunch ? 'bg-primary' : 'bg-muted-foreground'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              settings.autoLaunch ? 'translate-x-4.5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </SettingItem>

      {/* 语言设置 */}
      <SettingItem title="语言设置" description="选择应用界面语言">
        <div className="relative language-dropdown w-56">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 bg-secondary rounded-lg border border-border hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-foreground">{currentLanguage.native}</div>
              <div className="text-xs text-muted-foreground">{currentLanguage.label}</div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-lg border border-border shadow-lg z-50">
              <div className="py-1">
                {languages.map((language) => (
                  <button
                    key={language.value}
                    onClick={() => {
                      onSettingsChange({ language: language.value as AppSettings['language'] })
                      setIsDropdownOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 hover:bg-accent transition-colors ${
                      language.value === settings.language ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-foreground">{language.native}</div>
                      <div className="text-xs text-muted-foreground">{language.label}</div>
                    </div>
                    {language.value === settings.language ? (
                      <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                    ) : (
                      <div className="w-1.5 h-1.5 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </SettingItem>

      {/* 默认模型设置 */}
      <SettingItem
        title="默认模型"
        description={
          availableModels.length > 0
            ? '选择新对话时使用的默认模型'
            : '没有可用的模型，请前往提供商页面启用供应商并选择模型'
        }
      >
        {availableModels.length > 0 ? (
          <div className="relative model-dropdown w-56">
            <button
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-secondary rounded-lg border border-border hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-foreground">
                  {currentModel ? currentModel.label : '请选择默认模型'}
                </div>
                {currentModel && (
                  <div className="text-xs text-muted-foreground capitalize">
                    {currentModel.provider}
                  </div>
                )}
              </div>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                  isModelDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isModelDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-lg border border-border shadow-lg z-50 max-h-60 overflow-y-auto">
                <div className="py-1">
                  {availableModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSettingsChange({ defaultModel: model.id })
                        setIsModelDropdownOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 hover:bg-accent transition-colors ${
                        model.id === settings.defaultModel ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-foreground">{model.label}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {model.provider}
                        </div>
                      </div>
                      {model.id === settings.defaultModel ? (
                        <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                      ) : (
                        <div className="w-1.5 h-1.5 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">请前往提供商页面启用供应商并选择模型</div>
        )}
      </SettingItem>
    </div>
  )
}
