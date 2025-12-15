import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog'
import { Button } from '../ui/button'

interface DeleteProviderDialogProps {
  isOpen: boolean
  providerName: string
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteProviderDialog({
  isOpen,
  providerName,
  onClose,
  onConfirm
}: DeleteProviderDialogProps): ReactElement {
  const { t } = useTranslation('settings')

  const handleConfirm = (): void => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('deleteProvider')}</DialogTitle>
          <DialogDescription>
            {t('deleteProviderConfirm', { name: providerName })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel', { ns: 'common' })}
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm}>
            {t('delete', { ns: 'common' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
