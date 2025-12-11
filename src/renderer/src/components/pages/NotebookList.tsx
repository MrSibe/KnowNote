import { useState, ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Plus } from 'lucide-react'
import NotebookCard from '../common/NotebookCard'
import TopNavigationBar from '../common/TopNavigationBar'
import RenameDialog from '../common/RenameDialog'
import DeleteConfirmDialog from '../common/DeleteConfirmDialog'
import { useNotebookStore } from '../../store/notebookStore'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '../ui/empty'

export default function NotebookList(): ReactElement {
  const navigate = useNavigate()
  const {
    notebooks,
    addNotebook,
    setCurrentNotebook,
    deleteNotebook,
    updateNotebook,
    addOpenedNotebook,
    removeOpenedNotebook
  } = useNotebookStore()
  const [renameNotebookId, setRenameNotebookId] = useState<string | null>(null)
  const [renameNotebookTitle, setRenameNotebookTitle] = useState('')
  const [deleteNotebookId, setDeleteNotebookId] = useState<string | null>(null)
  const [deleteNotebookTitle, setDeleteNotebookTitle] = useState('')

  const handleCreateNotebook = async (): Promise<void> => {
    // 颜色池
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]

    const newId = await addNotebook({
      title: `新笔记本 ${notebooks.length + 1}`,
      description: '开始你的笔记之旅',
      coverColor: randomColor,
      chatCount: 0
    })

    addOpenedNotebook(newId)
    setCurrentNotebook(newId)
    navigate(`/notebook/${newId}`)
  }

  const handleNotebookClick = (id: string): void => {
    addOpenedNotebook(id)
    setCurrentNotebook(id)
    navigate(`/notebook/${id}`)
  }

  const handleOpenDeleteDialog = (id: string): void => {
    const notebook = notebooks.find((nb) => nb.id === id)
    if (notebook) {
      setDeleteNotebookId(id)
      setDeleteNotebookTitle(notebook.title)
    }
  }

  const handleDeleteConfirm = (): void => {
    if (deleteNotebookId) {
      deleteNotebook(deleteNotebookId)
      removeOpenedNotebook(deleteNotebookId)
      setDeleteNotebookId(null)
    }
  }

  const handleDeleteClose = (): void => {
    setDeleteNotebookId(null)
  }

  const handleOpenRenameDialog = (id: string): void => {
    const notebook = notebooks.find((nb) => nb.id === id)
    if (notebook) {
      setRenameNotebookId(id)
      setRenameNotebookTitle(notebook.title)
    }
  }

  const handleRenameConfirm = (newTitle: string): void => {
    if (renameNotebookId) {
      updateNotebook(renameNotebookId, { title: newTitle })
      setRenameNotebookId(null)
    }
  }

  const handleRenameClose = (): void => {
    setRenameNotebookId(null)
  }

  return (
    <div className="flex flex-col h-screen bg-[#212121] text-gray-100">
      <TopNavigationBar isHomePage={true} onCreateClick={handleCreateNotebook} />

      {/* 主内容区域 */}
      <div className="flex-1 overflow-y-auto px-12 py-8">
        {notebooks.length === 0 ? (
          /* 空状态 - 占满整个区域 */
          <div className="h-full">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BookOpen className="w-16 h-16 text-gray-600" />
                </EmptyMedia>
                <EmptyTitle className="text-gray-100">还没有笔记本</EmptyTitle>
                <EmptyDescription className="text-gray-400">
                  开始创建你的第一个笔记本，记录你的想法和灵感
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <button
                  onClick={handleCreateNotebook}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-medium"
                >
                  <Plus className="w-4 h-4" />
                  创建第一个笔记本
                </button>
              </EmptyContent>
            </Empty>
          </div>
        ) : (
          /* 有笔记本时显示列表 */
          <div className="max-w-7xl mx-auto">
            {/* 标题 */}
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-100 mb-2">我的笔记本</h1>
              <p className="text-gray-400">共 {notebooks.length} 个笔记本</p>
            </div>

            {/* 笔记本网格 */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {notebooks.map((notebook) => (
                <NotebookCard
                  key={notebook.id}
                  notebook={notebook}
                  onClick={() => handleNotebookClick(notebook.id)}
                  onDelete={() => handleOpenDeleteDialog(notebook.id)}
                  onRename={() => handleOpenRenameDialog(notebook.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 重命名对话框 */}
      <RenameDialog
        isOpen={renameNotebookId !== null}
        currentTitle={renameNotebookTitle}
        onClose={handleRenameClose}
        onConfirm={handleRenameConfirm}
      />

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        isOpen={deleteNotebookId !== null}
        notebookTitle={deleteNotebookTitle}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
