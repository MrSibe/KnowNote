import { ReactElement, useEffect, useState, useMemo } from 'react'
import { Sun, Moon, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import SettingItem from './SettingItem'
import { useI18nStore } from '../../store/i18nStore'
import type { AppSettings } from '../../../../shared/types'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'

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
          // 如果模型有明确的type字段，按type分类
          // 如果没有type字段，默认当作chat模型（大部分模型都是chat模型）
          if (modelDetail?.type === 'embedding') {
            embeddingModels.push(modelObj)
          } else if (modelDetail?.type === 'chat' || !modelDetail?.type) {
            // chat模型或未分类的模型都放入chat列表
            chatModels.push(modelObj)
          }
        })
      }
    })

    console.log('[GeneralSettings] Available chat models:', chatModels)
    console.log('[GeneralSettings] Available embedding models:', embeddingModels)
    console.log('[GeneralSettings] Current defaultChatModel:', settings.defaultChatModel)
    console.log('[GeneralSettings] Current defaultEmbeddingModel:', settings.defaultEmbeddingModel)

    return { availableChatModels: chatModels, availableEmbeddingModels: embeddingModels }
  }, [providers, t, settings.defaultChatModel, settings.defaultEmbeddingModel])

  const currentChatModel =
    availableChatModels.find((model) => model.id === settings.defaultChatModel) ||
    availableChatModels[0]

  const currentEmbeddingModel =
    availableEmbeddingModels.find((model) => model.id === settings.defaultEmbeddingModel) ||
    availableEmbeddingModels[0]

  // 检查默认模型是否仍然可用，如果不可用则清空
  // 注意：只有当 providers 不为空时才执行检查，避免在 providers 加载期间误清空用户设置
  useEffect(() => {
    // 如果 providers 还在加载中（为空或只有"无"选项），不执行检查
    if (providers.length === 0) {
      return
    }

    // 检查默认对话模型
    const isChatModelAvailable = settings.defaultChatModel
      ? availableChatModels.some((model) => model.id === settings.defaultChatModel)
      : true

    if (!isChatModelAvailable && settings.defaultChatModel) {
      console.log('[GeneralSettings] 默认对话模型不可用，清空设置:', settings.defaultChatModel)
      onSettingsChange({ defaultChatModel: '' })
    }

    // 检查默认嵌入模型
    const isEmbeddingModelAvailable = settings.defaultEmbeddingModel
      ? availableEmbeddingModels.some((model) => model.id === settings.defaultEmbeddingModel)
      : true

    if (!isEmbeddingModelAvailable && settings.defaultEmbeddingModel) {
      console.log('[GeneralSettings] 默认嵌入模型不可用，清空设置:', settings.defaultEmbeddingModel)
      onSettingsChange({ defaultEmbeddingModel: '' })
    }
  }, [
    providers,
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
          <Button
            onClick={() => onSettingsChange({ theme: 'light' })}
            variant={settings.theme === 'light' ? 'default' : 'outline'}
            size="sm"
            className="gap-1.5"
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{t('light')}</span>
          </Button>
          <Button
            onClick={() => onSettingsChange({ theme: 'dark' })}
            variant={settings.theme === 'dark' ? 'default' : 'outline'}
            size="sm"
            className="gap-1.5"
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{t('dark')}</span>
          </Button>
        </div>
      </SettingItem>

      {/* 开机自启动设置 */}
      <SettingItem title={t('autoLaunch')} description={t('autoLaunchDesc')}>
        <Switch
          checked={settings.autoLaunch}
          onCheckedChange={(checked) => onSettingsChange({ autoLaunch: checked })}
        />
      </SettingItem>

      {/* 语言设置 */}
      <SettingItem title={t('language')} description={t('languageDesc')}>
        <div className="relative language-dropdown w-56">
          <Button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            variant="secondary"
            className="w-full flex items-center justify-between h-auto py-2"
          >
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {currentLanguage.native}
              </div>
              <div className="text-xs text-muted-foreground truncate">{currentLanguage.label}</div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </Button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-lg border border-border shadow-lg z-50 max-h-60 overflow-y-auto custom-scrollbar">
              <div className="py-1">
                {languages.map((language) => (
                  <Button
                    key={language.value}
                    onClick={() => {
                      const newLang = language.value as AppSettings['language']
                      onSettingsChange({ language: newLang })
                      changeLanguage(newLang)
                      setIsDropdownOpen(false)
                    }}
                    variant="ghost"
                    className={`w-full flex items-center justify-between px-3 h-auto py-2 rounded-none ${
                      language.value === settings.language ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {language.native}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{language.label}</div>
                    </div>
                    {language.value === settings.language ? (
                      <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                    ) : (
                      <div className="w-1.5 h-1.5 shrink-0" />
                    )}
                  </Button>
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
            <Button
              onClick={() => setIsChatModelDropdownOpen(!isChatModelDropdownOpen)}
              variant="secondary"
              className="w-full flex items-center justify-between h-auto py-2"
            >
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {currentChatModel ? currentChatModel.label : t('pleaseSelectModel')}
                </div>
                {currentChatModel && (
                  <div className="text-xs text-muted-foreground capitalize truncate">
                    {currentChatModel.provider}
                  </div>
                )}
              </div>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ${
                  isChatModelDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </Button>

            {isChatModelDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-lg border border-border shadow-lg z-50 max-h-60 overflow-y-auto custom-scrollbar">
                <div className="py-1">
                  {availableChatModels.map((model) => (
                    <Button
                      key={model.id}
                      onClick={() => {
                        onSettingsChange({ defaultChatModel: model.id })
                        setIsChatModelDropdownOpen(false)
                      }}
                      variant="ghost"
                      className={`w-full flex items-center justify-between px-3 h-auto py-2 rounded-none ${
                        model.id === settings.defaultChatModel ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {model.label}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize truncate">
                          {model.provider}
                        </div>
                      </div>
                      {model.id === settings.defaultChatModel ? (
                        <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                      ) : (
                        <div className="w-1.5 h-1.5 shrink-0" />
                      )}
                    </Button>
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
            <Button
              onClick={() => setIsEmbeddingModelDropdownOpen(!isEmbeddingModelDropdownOpen)}
              variant="secondary"
              className="w-full flex items-center justify-between h-auto py-2"
            >
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {currentEmbeddingModel ? currentEmbeddingModel.label : t('pleaseSelectModel')}
                </div>
                {currentEmbeddingModel && (
                  <div className="text-xs text-muted-foreground capitalize truncate">
                    {currentEmbeddingModel.provider}
                  </div>
                )}
              </div>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ${
                  isEmbeddingModelDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </Button>

            {isEmbeddingModelDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-lg border border-border shadow-lg z-50 max-h-60 overflow-y-auto custom-scrollbar">
                <div className="py-1">
                  {availableEmbeddingModels.map((model) => (
                    <Button
                      key={model.id}
                      onClick={() => {
                        onSettingsChange({ defaultEmbeddingModel: model.id })
                        setIsEmbeddingModelDropdownOpen(false)
                      }}
                      variant="ghost"
                      className={`w-full flex items-center justify-between px-3 h-auto py-2 rounded-none ${
                        model.id === settings.defaultEmbeddingModel ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {model.label}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize truncate">
                          {model.provider}
                        </div>
                      </div>
                      {model.id === settings.defaultEmbeddingModel ? (
                        <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                      ) : (
                        <div className="w-1.5 h-1.5 shrink-0" />
                      )}
                    </Button>
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
