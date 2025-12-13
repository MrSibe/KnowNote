import { useState, ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import NotebookCard from '../common/NotebookCard'
import TopNavigationBar from '../common/TopNavigationBar'
import RenameDialog from '../common/RenameDialog'
import DeleteConfirmDialog from '../common/DeleteConfirmDialog'
import { useNotebookStore } from '../../store/notebookStore'
import { ScrollArea } from '../ui/scroll-area'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '../ui/empty'

export default function NotebookList(): ReactElement {
  const { t } = useTranslation('ui')
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
    const newId = await addNotebook({
      title: t('newNotebook', { index: notebooks.length + 1 }),
      description: t('notebookDescription')
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
    <div className="flex flex-col h-screen bg-background text-foreground">
      <TopNavigationBar isHomePage={true} onCreateClick={handleCreateNotebook} />

      {/* 主内容区域 */}
      <ScrollArea className="flex-1">
        {notebooks.length === 0 ? (
          /* 空状态 - 占满整个区域 */
          <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-12">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BookOpen className="w-16 h-16 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle className="text-foreground">{t('noNotebooks')}</EmptyTitle>
                <EmptyDescription className="text-muted-foreground">
                  {t('noNotebooksDesc')}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <button
                  onClick={handleCreateNotebook}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 rounded-lg transition-colors text-primary-foreground font-medium"
                >
                  <Plus className="w-4 h-4" />
                  {t('createFirstNotebook')}
                </button>
              </EmptyContent>
            </Empty>
          </div>
        ) : (
          <div className="px-12 py-8">
            {/* 有笔记本时显示列表 */}
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
              {/* 标题 */}
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">{t('myNotebooks')}</h1>
                <p className="text-muted-foreground">
                  {t('totalNotebooks', { count: notebooks.length })}
                </p>
              </div>

              {/* 笔记本网格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
          </div>
        )}
      </ScrollArea>

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
