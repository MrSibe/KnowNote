import { ReactElement } from 'react'

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
}: DeleteConfirmDialogProps): ReactElement | null {
  if (!isOpen) return null

  const handleConfirm = (): void => {
    onConfirm()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl p-6 w-[420px] border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-foreground mb-3">删除笔记本</h3>
        <p className="text-sm text-muted-foreground mb-6">
          确定要删除笔记本{' '}
          <span className="text-foreground font-medium">&quot;{notebookTitle}&quot;</span> 吗？
          <br />
          此操作无法撤销。
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-secondary-foreground text-sm"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 bg-destructive hover:bg-destructive/90 rounded-lg transition-colors text-destructive-foreground text-sm"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  )
}
