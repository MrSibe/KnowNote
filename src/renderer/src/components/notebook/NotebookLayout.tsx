import { useEffect, ReactElement } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import TopNavigationBar from '../common/TopNavigationBar'
import ResizableLayout from '../layouts/ResizableLayout'
import SourcePanel from './SourcePanel'
import ProcessPanel from './ProcessPanel'
import NotePanel from './NotePanel'
import { useNotebookStore } from '../../store/notebookStore'
import { useChatStore } from '../../store/chatStore'

export default function NotebookLayout(): ReactElement {
  const { t } = useTranslation('ui')
  const navigate = useNavigate()
  const { id } = useParams()
  const { notebooks, addNotebook, addOpenedNotebook, setCurrentNotebook } = useNotebookStore()
  const { loadActiveSession } = useChatStore()

  // 当进入笔记本时，设置openedNotebook和currentNotebook，并加载栈顶session
  useEffect(() => {
    if (id) {
      addOpenedNotebook(id)
      setCurrentNotebook(id)
      // 关键改动：自动加载该Notebook的栈顶session
      loadActiveSession(id).catch((err) => {
        console.error('[NotebookLayout] Failed to load session for notebook:', id, err)
      })
    }
  }, [id, addOpenedNotebook, setCurrentNotebook, loadActiveSession])

  const handleCreateNotebook = async (): Promise<void> => {
    const newId = await addNotebook({
      title: t('newNotebook', { index: notebooks.length + 1 }),
      description: t('notebookDescription')
    })

    navigate(`/notebook/${newId}`)
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <TopNavigationBar onCreateClick={handleCreateNotebook} />

      <ResizableLayout
        leftPanel={<SourcePanel />}
        centerPanel={<ProcessPanel />}
        rightPanel={<NotePanel />}
      />
    </div>
  )
}
