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
  const currentMindMapPrompt = settings.prompts?.mindMap?.[currentLanguage] || ''
  const currentQuizPrompt = settings.prompts?.quiz?.[currentLanguage] || ''

  // 保存初始提示词（来自后端的默认值或用户之前保存的值）
  const [initialMindMapPrompt, setInitialMindMapPrompt] = useState<string>(currentMindMapPrompt)
  const [initialQuizPrompt, setInitialQuizPrompt] = useState<string>(currentQuizPrompt)

  // 当组件首次加载或语言切换时，保存初始值
  useEffect(() => {
    setInitialMindMapPrompt(currentMindMapPrompt)
    setInitialQuizPrompt(currentQuizPrompt)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage]) // 只在语言切换时更新

  const isMindMapModified = currentMindMapPrompt !== initialMindMapPrompt
  const isQuizModified = currentQuizPrompt !== initialQuizPrompt

  const handleMindMapPromptChange = (value: string) => {
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

  const handleQuizPromptChange = (value: string) => {
    onSettingsChange({
      prompts: {
        ...settings.prompts,
        quiz: {
          ...settings.prompts?.quiz,
          [currentLanguage]: value
        }
      }
    })
  }

  const handleMindMapReset = () => {
    // 只重置当前语言的提示词到初始值
    onSettingsChange({
      prompts: {
        ...settings.prompts,
        mindMap: {
          ...settings.prompts?.mindMap,
          [currentLanguage]: initialMindMapPrompt
        }
      }
    })
  }

  const handleQuizReset = () => {
    // 只重置当前语言的提示词到初始值
    onSettingsChange({
      prompts: {
        ...settings.prompts,
        quiz: {
          ...settings.prompts?.quiz,
          [currentLanguage]: initialQuizPrompt
        }
      }
    })
  }

  return (
    <div className="max-w-2xl flex flex-col gap-4">
      <SettingItem
        title={t('mindMapPrompt')}
        description=""
        layout="vertical"
        action={
          isMindMapModified ? (
            <Button variant="outline" size="sm" onClick={handleMindMapReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('resetPrompt')}
            </Button>
          ) : undefined
        }
      >
        <div className="relative">
          <Textarea
            value={currentMindMapPrompt}
            onChange={(e) => handleMindMapPromptChange(e.target.value)}
            placeholder={t('promptPlaceholder')}
            className="w-full h-[400px] max-h-[400px] resize-none bg-input border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring font-mono text-sm leading-relaxed overflow-y-auto"
          />
        </div>
      </SettingItem>

      <SettingItem
        title={t('quizPrompt')}
        description=""
        layout="vertical"
        action={
          isQuizModified ? (
            <Button variant="outline" size="sm" onClick={handleQuizReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('resetPrompt')}
            </Button>
          ) : undefined
        }
      >
        <div className="relative">
          <Textarea
            value={currentQuizPrompt}
            onChange={(e) => handleQuizPromptChange(e.target.value)}
            placeholder={t('promptPlaceholder')}
            className="w-full h-[400px] max-h-[400px] resize-none bg-input border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring font-mono text-sm leading-relaxed overflow-y-auto"
          />
        </div>
      </SettingItem>
    </div>
  )
}
