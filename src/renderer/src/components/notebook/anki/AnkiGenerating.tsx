import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAnkiStore } from '../../../store/ankiStore'
import { Progress } from '../../ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'

export default function AnkiGenerating() {
  const { t } = useTranslation('anki')
  const { generationProgress } = useAnkiStore()

  const getStageText = (stage: string): string => {
    const stageMap: Record<string, string> = {
      creating_record: t('creatingRecord'),
      aggregating_content: t('aggregatingContent'),
      generating_cards: t('generatingCards'),
      parsing_result: t('parsingResult'),
      validating_data: t('validatingData'),
      saving_cards: t('savingCards'),
      completed: t('completed')
    }
    return stageMap[stage] || stage
  }

  return (
    <div className="flex items-center justify-center h-full p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            {t('generatingCards')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {generationProgress && getStageText(generationProgress.stage)}
          </div>
          {generationProgress && (
            <Progress value={generationProgress.progress} className="w-full" />
          )}
          <div className="text-xs text-muted-foreground text-center">
            {generationProgress ? `${generationProgress.progress}%` : '0%'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
