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
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a1a] rounded-2xl p-6 w-[420px] border border-gray-800/50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-100 mb-3">删除笔记本</h3>
        <p className="text-sm text-gray-400 mb-6">
          确定要删除笔记本 <span className="text-gray-200 font-medium">"{notebookTitle}"</span> 吗？
          <br />
          此操作无法撤销。
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#2a2a2a] hover:bg-[#333333] rounded-lg transition-colors text-gray-300 text-sm"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white text-sm"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  )
}
