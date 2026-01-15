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

interface UnsavedChangesDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function UnsavedChangesDialog({
  isOpen,
  onClose,
  onConfirm
}: UnsavedChangesDialogProps): ReactElement {
  const { t } = useTranslation(['common', 'notebook'])

  const handleConfirm = (): void => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('notebook:unsavedChangesTitle')}</DialogTitle>
          <DialogDescription>{t('notebook:unsavedChangesWarning')}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common:cancel')}
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm}>
            {t('notebook:leave')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
