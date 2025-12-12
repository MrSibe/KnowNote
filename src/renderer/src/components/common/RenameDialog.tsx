import { useState, useEffect, useRef, ReactElement } from 'react'

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
  const [title, setTitle] = useState(currentTitle)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTitle(currentTitle)
  }, [currentTitle])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (title.trim() && title !== currentTitle) {
      onConfirm(title.trim())
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl p-8 w-[440px] border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-foreground mb-6">重命名笔记本</h3>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground text-base focus:outline-none focus:ring-2 focus:ring-ring transition-colors placeholder-muted-foreground"
            placeholder="请输入笔记本名称"
          />

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-secondary-foreground text-sm font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!title.trim() || title === currentTitle}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-secondary disabled:cursor-not-allowed disabled:text-muted-foreground rounded-lg transition-colors text-primary-foreground text-sm font-medium"
            >
              确认
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
