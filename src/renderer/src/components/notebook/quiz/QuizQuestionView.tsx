import { useState } from 'react'
import { Lightbulb, Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuizStore } from '../../../store/quizStore'
import type { QuizQuestion } from '../../../../../shared/types/quiz'
import { Button } from '../../ui/button'
import { Checkbox } from '../../ui/checkbox'
import { cn } from '../../../lib/utils'

export default function QuizQuestionView() {
  const { t } = useTranslation('quiz')
  const {
    currentQuiz,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    setAnswer,
    showHints,
    toggleHint,
    getTotalQuestions,
    setResultMode
  } = useQuizStore()

  const [showExplanation, setShowExplanation] = useState(false)

  if (!currentQuiz) return null

  const questions = currentQuiz.questionsData as any as QuizQuestion[]
  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = getTotalQuestions()
  const selectedAnswer = answers[currentQuestion.id]
  const showHint = showHints[currentQuestion.id] || false

  const handleSelectAnswer = (answerIndex: number) => {
    if (!showExplanation) {
      setAnswer(currentQuestion.id, answerIndex)
      setShowExplanation(true)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setShowExplanation(false)
    } else {
      // 最后一题，显示结果
      setResultMode(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setShowExplanation(false)
    }
  }

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer

  return (
    <div className="h-full flex flex-col p-8">
      <div className="w-full flex flex-col gap-6 h-full">
        {/* 头部 */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">
            {t('question')} {currentQuestionIndex + 1}/{totalQuestions}
          </h2>
          <Button variant="ghost" size="sm" onClick={() => toggleHint(currentQuestion.id)}>
            <Lightbulb className="w-4 h-4 mr-1" />
            {showHint ? t('hideHint') : t('showHint')}
          </Button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto flex flex-col gap-6">
          {/* 题目文本 */}
          <p className="text-lg leading-relaxed font-medium text-foreground">
            {currentQuestion.questionText}
          </p>

          {/* 选项列表 */}
          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index
              const isCorrectOption = index === currentQuestion.correctAnswer
              const showResult = showExplanation

              return (
                <div
                  key={index}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors',
                    isSelected && !showResult && 'border-primary bg-primary/5',
                    showResult && isCorrectOption && 'border-green-500 bg-green-50 dark:bg-green-950',
                    showResult &&
                      isSelected &&
                      !isCorrectOption &&
                      'border-red-500 bg-red-50 dark:bg-red-950',
                    !isSelected && !showResult && 'border-border hover:bg-muted/50'
                  )}
                  onClick={() => handleSelectAnswer(index)}
                >
                  <Checkbox checked={isSelected} disabled={showResult} />
                  <span className="text-base flex-1 text-foreground">
                    {String.fromCharCode(65 + index)}. {option}
                  </span>
                  {showResult && isCorrectOption && (
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  )}
                  {showResult && isSelected && !isCorrectOption && (
                    <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
              )
            })}
          </div>

          {/* 提示（可折叠） */}
          {showHint && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col gap-1 text-sm text-blue-900 dark:text-blue-100">
                  {currentQuestion.hints.map((hint, i) => (
                    <p key={i}>• {hint}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 答案解释（答题后显示） */}
          {showExplanation && selectedAnswer !== undefined && (
            <div
              className={cn(
                'border rounded-lg p-4',
                isCorrect
                  ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
              )}
            >
              <div className="flex items-start gap-2">
                <div
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                    isCorrect ? 'bg-green-500' : 'bg-red-500'
                  )}
                >
                  {isCorrect ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : (
                    <X className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <p
                    className={cn(
                      'font-medium text-sm',
                      isCorrect
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-red-900 dark:text-red-100'
                    )}
                  >
                    {isCorrect ? t('correct') : t('incorrect')}
                  </p>
                  <p
                    className={cn(
                      'text-sm',
                      isCorrect
                        ? 'text-green-800 dark:text-green-200'
                        : 'text-red-800 dark:text-red-200'
                    )}
                  >
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
            {t('previous')}
          </Button>
          <Button onClick={handleNext} disabled={selectedAnswer === undefined}>
            {currentQuestionIndex === totalQuestions - 1 ? t('viewResult') : t('next')}
          </Button>
        </div>
      </div>
    </div>
  )
}
