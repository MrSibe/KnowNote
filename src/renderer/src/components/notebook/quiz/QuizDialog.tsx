import { Dialog, DialogContent, DialogTitle } from '../../ui/dialog'
import { Button } from '../../ui/button'
import { RefreshCw, Loader2, ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuizStore } from '../../../store/quizStore'
import { ScrollArea } from '../../ui/scroll-area'
import QuizGenerating from './QuizGenerating'
import QuizQuestionView from './QuizQuestionView'
import QuizResultView from './QuizResultView'

export default function QuizDialog({ notebookId }: { notebookId: string }) {
  const { t } = useTranslation('quiz')
  const {
    isDialogOpen,
    setDialogOpen,
    currentQuiz,
    isGenerating,
    generationProgress,
    generateQuiz,
    isResultMode
  } = useQuizStore()

  const handleGenerate = async () => {
    if (notebookId) {
      try {
        await generateQuiz(notebookId)
      } catch (error) {
        console.error('Failed to generate quiz:', error)
      }
    }
  }

  const handleClose = () => {
    setDialogOpen(false)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent
        className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0"
        style={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* 头部 - 固定高度 */}
        <div
          className="p-6 pb-4 border-b border-border"
          style={{
            flexShrink: 0
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleClose}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                type="button"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <DialogTitle>{t('quiz')}</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              {!currentQuiz && !isGenerating && (
                <Button onClick={handleGenerate} size="sm">
                  {t('generateQuiz')}
                </Button>
              )}
              {currentQuiz && !isGenerating && !isResultMode && (
                <Button onClick={handleGenerate} size="sm" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('generateQuiz')}
                </Button>
              )}
              {isGenerating && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('generating')} ({generationProgress?.progress || 0}%)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 内容区域 - 自动填充剩余空间 */}
        <ScrollArea className="flex-1 p-6">
          {isGenerating ? (
            <QuizGenerating />
          ) : currentQuiz ? (
            isResultMode ? (
              <QuizResultView />
            ) : (
              <QuizQuestionView />
            )
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              {t('noQuizYet')}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
