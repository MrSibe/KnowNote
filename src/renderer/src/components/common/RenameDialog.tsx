import { useState, useEffect, useRef, ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface RenameDialogProps {
  isOpen: boolean
  currentTitle: string
  onClose: () => void
  onConfirm: (newTitle: string) => void
}

export default function RenameDialog({
  isOpen,
  currentTitle,
  onClose,
  onConfirm
}: RenameDialogProps): ReactElement | null {
  const { t } = useTranslation(['common', 'notebook'])
  const [title, setTitle] = useState(currentTitle)
  const inputRef = useRef<HTMLInputElement>(null)

  // 同步 currentTitle 变化
  useEffect(() => {
    setTitle(currentTitle)
  }, [currentTitle])

  // 自动聚焦并选中文本
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // 使用 setTimeout 确保 Dialog 动画完成后再聚焦
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 50)
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (trimmedTitle && trimmedTitle !== currentTitle) {
      onConfirm(trimmedTitle)
      onClose()
    }
  }

  // 判断是否可以提交
  const canSubmit = title.trim() && title.trim() !== currentTitle

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('notebook:renameNotebook')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('notebook:enterNotebookName')}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common:cancel')}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {t('common:confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
