import { ReactElement, useEffect, useState, useMemo } from 'react'
import { Sun, Moon, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import SettingItem from './SettingItem'
import { useI18nStore } from '../../store/i18nStore'
import type { AppSettings } from '../../../../shared/types'

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
  const { t } = useTranslation('settings')
  const { changeLanguage } = useI18nStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isChatModelDropdownOpen, setIsChatModelDropdownOpen] = useState(false)
  const [isEmbeddingModelDropdownOpen, setIsEmbeddingModelDropdownOpen] = useState(false)
  const currentLanguage = languages.find((lang) => lang.value === settings.language) || languages[0]

  // 分别获取对话模型和嵌入模型
  const { availableChatModels, availableEmbeddingModels } = useMemo(() => {
    const chatModels: Array<{ id: string; provider: string; label: string }> = []
    const embeddingModels: Array<{ id: string; provider: string; label: string }> = []

    // 添加空模型选项
    chatModels.push({
      id: '',
      provider: '',
      label: t('none')
    })

    embeddingModels.push({
      id: '',
      provider: '',
      label: t('none')
    })

    providers.forEach((provider) => {
      if (provider.enabled && provider.config.models && Array.isArray(provider.config.models)) {
        // 从 modelDetails 获取完整的模型信息（包含 type 字段）
        const modelDetails = provider.config.modelDetails || []

        provider.config.models.forEach((modelId: string) => {
          const modelDetail = modelDetails.find((m: any) => m.id === modelId)
          const modelObj = {
            id: `${provider.providerName}:${modelId}`,
            provider: provider.providerName,
            label: modelId
          }

          // 根据类型分类
          if (modelDetail?.type === 'chat') {
            chatModels.push(modelObj)
          } else if (modelDetail?.type === 'embedding') {
            embeddingModels.push(modelObj)
          }
        })
      }
    })

    return { availableChatModels: chatModels, availableEmbeddingModels: embeddingModels }
  }, [providers, t])

  const currentChatModel =
    availableChatModels.find((model) => model.id === settings.defaultChatModel) ||
    availableChatModels[0]

  const currentEmbeddingModel =
    availableEmbeddingModels.find((model) => model.id === settings.defaultEmbeddingModel) ||
    availableEmbeddingModels[0]

  // 检查默认模型是否仍然可用，如果不可用则清空
  useEffect(() => {
    // 检查默认对话模型
    const isChatModelAvailable = settings.defaultChatModel
      ? availableChatModels.some((model) => model.id === settings.defaultChatModel)
      : true

    if (!isChatModelAvailable && settings.defaultChatModel) {
      onSettingsChange({ defaultChatModel: '' })
    }

    // 检查默认嵌入模型
    const isEmbeddingModelAvailable = settings.defaultEmbeddingModel
      ? availableEmbeddingModels.some((model) => model.id === settings.defaultEmbeddingModel)
      : true

    if (!isEmbeddingModelAvailable && settings.defaultEmbeddingModel) {
      onSettingsChange({ defaultEmbeddingModel: '' })
    }
  }, [
    settings.defaultChatModel,
    settings.defaultEmbeddingModel,
    availableChatModels,
    availableEmbeddingModels,
    onSettingsChange
  ])

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
      if (!target.closest('.chat-model-dropdown')) {
        setIsChatModelDropdownOpen(false)
      }
      if (!target.closest('.embedding-model-dropdown')) {
        setIsEmbeddingModelDropdownOpen(false)
      }
    }

    if (isDropdownOpen || isChatModelDropdownOpen || isEmbeddingModelDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isDropdownOpen, isChatModelDropdownOpen, isEmbeddingModelDropdownOpen])

  return (
    <div className="max-w-2xl flex flex-col gap-4">
      {/* 主题模式设置 */}
      <SettingItem title={t('themeMode')} description={t('selectTheme')}>
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
            <span className="text-xs font-medium">{t('light')}</span>
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
            <span className="text-xs font-medium">{t('dark')}</span>
          </button>
        </div>
      </SettingItem>

      {/* 开机自启动设置 */}
      <SettingItem title={t('autoLaunch')} description={t('autoLaunchDesc')}>
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
      <SettingItem title={t('language')} description={t('languageDesc')}>
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
                      const newLang = language.value as AppSettings['language']
                      onSettingsChange({ language: newLang })
                      changeLanguage(newLang)
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

      {/* 默认对话模型设置 */}
      <SettingItem
        title={t('defaultChatModel')}
        description={
          availableChatModels.length > 0 ? t('defaultChatModelDesc') : t('noAvailableModel')
        }
      >
        {availableChatModels.length > 0 && (
          <div className="relative chat-model-dropdown w-56">
            <button
              onClick={() => setIsChatModelDropdownOpen(!isChatModelDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-secondary rounded-lg border border-border hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-foreground">
                  {currentChatModel ? currentChatModel.label : t('pleaseSelectModel')}
                </div>
                {currentChatModel && (
                  <div className="text-xs text-muted-foreground capitalize">
                    {currentChatModel.provider}
                  </div>
                )}
              </div>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                  isChatModelDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isChatModelDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-lg border border-border shadow-lg z-50 max-h-60 overflow-y-auto">
                <div className="py-1">
                  {availableChatModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSettingsChange({ defaultChatModel: model.id })
                        setIsChatModelDropdownOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 hover:bg-accent transition-colors ${
                        model.id === settings.defaultChatModel ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-foreground">{model.label}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {model.provider}
                        </div>
                      </div>
                      {model.id === settings.defaultChatModel ? (
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
        )}
      </SettingItem>

      {/* 默认嵌入模型设置 */}
      <SettingItem
        title={t('defaultEmbeddingModel')}
        description={
          availableEmbeddingModels.length > 0
            ? t('defaultEmbeddingModelDesc')
            : t('noAvailableModel')
        }
      >
        {availableEmbeddingModels.length > 0 && (
          <div className="relative embedding-model-dropdown w-56">
            <button
              onClick={() => setIsEmbeddingModelDropdownOpen(!isEmbeddingModelDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-secondary rounded-lg border border-border hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-foreground">
                  {currentEmbeddingModel ? currentEmbeddingModel.label : t('pleaseSelectModel')}
                </div>
                {currentEmbeddingModel && (
                  <div className="text-xs text-muted-foreground capitalize">
                    {currentEmbeddingModel.provider}
                  </div>
                )}
              </div>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                  isEmbeddingModelDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isEmbeddingModelDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-lg border border-border shadow-lg z-50 max-h-60 overflow-y-auto">
                <div className="py-1">
                  {availableEmbeddingModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSettingsChange({ defaultEmbeddingModel: model.id })
                        setIsEmbeddingModelDropdownOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 hover:bg-accent transition-colors ${
                        model.id === settings.defaultEmbeddingModel ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-foreground">{model.label}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {model.provider}
                        </div>
                      </div>
                      {model.id === settings.defaultEmbeddingModel ? (
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
        )}
      </SettingItem>
    </div>
  )
}
