import { useEffect, ReactElement } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopNavigationBar from '../common/TopNavigationBar'
import ResizableLayout from '../layouts/ResizableLayout'
import SourcePanel from './SourcePanel'
import ProcessPanel from './ProcessPanel'
import NotePanel from './NotePanel'
import { useNotebookStore } from '../../store/notebookStore'
import { useChatStore } from '../../store/chatStore'

export default function NotebookLayout(): ReactElement {
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
      loadActiveSession(id)
    }
  }, [id, addOpenedNotebook, setCurrentNotebook, loadActiveSession])

  const handleCreateNotebook = async (): Promise<void> => {
    // 随机选择一个 emoji 图标
    const icons = ['📔', '📕', '📗', '📘', '📙', '📓', '📖', '📚']
    const randomIcon = icons[Math.floor(Math.random() * icons.length)]

    const newId = await addNotebook({
      title: `新笔记本 ${notebooks.length + 1}`,
      description: '开始你的笔记之旅',
      icon: randomIcon
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
