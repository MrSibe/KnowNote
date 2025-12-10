import { useState, useEffect, useRef } from 'react'

interface RenameDialogProps {
  isOpen: boolean
  currentTitle: string
  onClose: () => void
  onConfirm: (newTitle: string) => void
}

export default function RenameDialog({ isOpen, currentTitle, onClose, onConfirm }: RenameDialogProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && title !== currentTitle) {
      onConfirm(title.trim())
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
        className="bg-[#1a1a1a] rounded-2xl p-8 w-[440px] border border-gray-800/50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-gray-100 mb-6">重命名笔记本</h3>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-4 py-3 text-gray-100 text-base focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-500"
            placeholder="请输入笔记本名称"
          />

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-[#2a2a2a] hover:bg-[#333333] rounded-lg transition-colors text-gray-300 text-sm font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!title.trim() || title === currentTitle}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-500 rounded-lg transition-colors text-white text-sm font-medium"
            >
              确认
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
