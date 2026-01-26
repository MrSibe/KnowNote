import { ReactElement, useEffect, useMemo } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useI18nStore } from '../../store/i18nStore'
import type { AppSettings } from '../../../../shared/types'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Field, FieldDescription, FieldLabel, FieldGroup, FieldSet } from '../ui/field'

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

  // 分别获取对话模型和嵌入模型
  const { availableChatModels, availableEmbeddingModels } = useMemo(() => {
    const chatModels: Array<{ id: string; provider: string; label: string }> = []
    const embeddingModels: Array<{ id: string; provider: string; label: string }> = []

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

  return (
    <FieldSet>
      <FieldGroup>
        {/* 主题模式设置 */}
        <Field orientation="horizontal">
          <div className="flex-1">
            <FieldLabel>{t('themeMode')}</FieldLabel>
            <FieldDescription>{t('selectTheme')}</FieldDescription>
          </div>
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
        </Field>

        {/* 开机自启动设置 */}
        <Field orientation="horizontal">
          <div className="flex-1">
            <FieldLabel>{t('autoLaunch')}</FieldLabel>
            <FieldDescription>{t('autoLaunchDesc')}</FieldDescription>
          </div>
          <Switch
            checked={settings.autoLaunch}
            onCheckedChange={(checked) => onSettingsChange({ autoLaunch: checked })}
          />
        </Field>

        {/* 语言设置 */}
        <Field orientation="horizontal">
          <div className="flex-1">
            <FieldLabel htmlFor="language-select">{t('language')}</FieldLabel>
            <FieldDescription>{t('languageDesc')}</FieldDescription>
          </div>
          <Select
            value={settings.language}
            onValueChange={(value) => {
              const newLang = value as AppSettings['language']
              onSettingsChange({ language: newLang })
              changeLanguage(newLang)
            }}
          >
            <SelectTrigger id="language-select" className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.value} value={language.value}>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{language.native}</span>
                    <span className="text-xs text-muted-foreground">{language.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* 默认对话模型设置 */}
        <Field orientation="horizontal">
          <div className="flex-1">
            <FieldLabel htmlFor="chat-model-select">{t('defaultChatModel')}</FieldLabel>
            <FieldDescription>
              {availableChatModels.length > 0 ? t('defaultChatModelDesc') : t('noAvailableModel')}
            </FieldDescription>
          </div>
          {availableChatModels.length > 0 && (
            <Select
              value={settings.defaultChatModel || undefined}
              onValueChange={(value) => onSettingsChange({ defaultChatModel: value })}
            >
              <SelectTrigger id="chat-model-select" className="w-56">
                <SelectValue placeholder={t('pleaseSelectModel')} />
              </SelectTrigger>
              <SelectContent>
                {availableChatModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{model.label}</span>
                      {model.provider && (
                        <span className="text-xs text-muted-foreground capitalize">
                          {model.provider}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Field>

        {/* 默认嵌入模型设置 */}
        <Field orientation="horizontal">
          <div className="flex-1">
            <FieldLabel htmlFor="embedding-model-select">{t('defaultEmbeddingModel')}</FieldLabel>
            <FieldDescription>
              {availableEmbeddingModels.length > 0
                ? t('defaultEmbeddingModelDesc')
                : t('noAvailableModel')}
            </FieldDescription>
          </div>
          {availableEmbeddingModels.length > 0 && (
            <Select
              value={settings.defaultEmbeddingModel || undefined}
              onValueChange={(value) => onSettingsChange({ defaultEmbeddingModel: value })}
            >
              <SelectTrigger id="embedding-model-select" className="w-56">
                <SelectValue placeholder={t('pleaseSelectModel')} />
              </SelectTrigger>
              <SelectContent>
                {availableEmbeddingModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{model.label}</span>
                      {model.provider && (
                        <span className="text-xs text-muted-foreground capitalize">
                          {model.provider}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}
