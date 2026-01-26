import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { Separator } from '../ui/separator'

interface HeroProps {
  notebookCount: number
}

export default function Hero({ notebookCount }: HeroProps): ReactElement {
  const { t } = useTranslation('ui')

  return (
    <div className="px-12 pt-12 pb-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <h1 className="text-5xl font-bold text-foreground tracking-tight">{t('myNotebooks')}</h1>
        <p className="text-base text-muted-foreground font-medium">
          {t('totalNotebooks', { count: notebookCount })}
        </p>
        <Separator />
      </div>
    </div>
  )
}
