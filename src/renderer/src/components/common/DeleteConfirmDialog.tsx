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

interface DeleteConfirmDialogProps {
  isOpen: boolean
  notebookTitle: string
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteConfirmDialog({
  isOpen,
  notebookTitle,
  onClose,
  onConfirm
}: DeleteConfirmDialogProps): ReactElement {
  const { t } = useTranslation(['common', 'notebook'])

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            {t('notebook:deleteNotebook')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('notebook:deleteConfirm', { name: notebookTitle })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} className="text-foreground">
            {t('common:cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('common:delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
