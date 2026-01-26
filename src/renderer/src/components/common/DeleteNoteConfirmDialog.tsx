import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../ui/alert-dialog'

interface DeleteNoteConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteNoteConfirmDialog({
  isOpen,
  onClose,
  onConfirm
}: DeleteNoteConfirmDialogProps): ReactElement {
  const { t } = useTranslation(['common', 'notebook'])

  const handleConfirm = (): void => {
    onConfirm()
    onClose()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('notebook:deleteNote')}</AlertDialogTitle>
          <AlertDialogDescription>{t('notebook:deleteNoteWarning')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{t('common:cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-destructive hover:bg-destructive/90">
            {t('common:delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
