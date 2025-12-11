import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopNavigationBar from '../common/TopNavigationBar'
import ResizableLayout from '../layouts/ResizableLayout'
import SourcePanel from './SourcePanel'
import ProcessPanel from './ProcessPanel'
import NotePanel from './NotePanel'
import { useNotebookStore } from '../../store/notebookStore'

export default function NotebookLayout() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { notebooks, addNotebook, addOpenedNotebook, setCurrentNotebook } = useNotebookStore()

  // 当进入笔记本时，设置openedNotebook和currentNotebook
  useEffect(() => {
    if (id) {
      addOpenedNotebook(id)
      setCurrentNotebook(id)
    }
  }, [id, addOpenedNotebook, setCurrentNotebook])

  const handleCreateNotebook = () => {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]

    const newId = addNotebook({
      title: `新笔记本 ${notebooks.length + 1}`,
      description: '开始你的笔记之旅',
      coverColor: randomColor,
      chatCount: 0
    })

    navigate(`/notebook/${newId}`)
  }

  return (
    <div className="flex flex-col h-screen bg-[#212121] text-gray-100">
      <TopNavigationBar onCreateClick={handleCreateNotebook} />

      <ResizableLayout
        leftPanel={<SourcePanel />}
        centerPanel={<ProcessPanel />}
        rightPanel={<NotePanel />}
      />
    </div>
  )
}
