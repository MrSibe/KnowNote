import { ReactElement, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { RotateCcw } from 'lucide-react'
import SettingItem from './SettingItem'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import type { AppSettings } from '../../../../shared/types'

interface PromptsSettingsProps {
  settings: AppSettings
  onSettingsChange: (updates: Partial<AppSettings>) => void
}

export default function PromptsSettings({
  settings,
  onSettingsChange
}: PromptsSettingsProps): ReactElement {
  const { t } = useTranslation('settings')

  const currentLanguage = settings.language
  // 后端的 mergeSettings 已经确保所有字段都有默认值，前端直接使用
  const currentPrompt = settings.prompts?.mindMap?.[currentLanguage] || ''

  // 保存初始提示词（来自后端的默认值或用户之前保存的值）
  const [initialPrompt, setInitialPrompt] = useState<string>(currentPrompt)

  // 当组件首次加载或语言切换时，保存初始值
  useEffect(() => {
    setInitialPrompt(currentPrompt)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage]) // 只在语言切换时更新

  const isModified = currentPrompt !== initialPrompt

  const handlePromptChange = (value: string) => {
    onSettingsChange({
      prompts: {
        ...settings.prompts,
        mindMap: {
          ...settings.prompts?.mindMap,
          [currentLanguage]: value
        }
      }
    })
  }

  const handleReset = () => {
    // 只重置当前语言的提示词到初始值
    onSettingsChange({
      prompts: {
        ...settings.prompts,
        mindMap: {
          ...settings.prompts?.mindMap,
          [currentLanguage]: initialPrompt
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t('promptSettings')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('mindMapPromptDesc')}</p>
      </div>

      <SettingItem
        title={t('mindMapPrompt')}
        description=""
        layout="vertical"
        action={
          isModified ? (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('resetPrompt')}
            </Button>
          ) : undefined
        }
      >
        <div className="relative">
          <Textarea
            value={currentPrompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder={t('promptPlaceholder')}
            className="w-full h-[400px] max-h-[400px] resize-none bg-input border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring font-mono text-sm leading-relaxed overflow-y-auto"
          />
        </div>
      </SettingItem>
    </div>
  )
}
