import { Home, Plus, X, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotebookStore } from '../store/notebookStore'
import { useState } from 'react'
import SettingsPanel from './SettingsPanel'

interface TopNavigationBarProps {
  onCreateClick: () => void
  isHomePage?: boolean
}

export default function TopNavigationBar({
  onCreateClick,
  isHomePage = false
}: TopNavigationBarProps) {
  const navigate = useNavigate()
  const { currentNotebook, openedNotebooks, removeOpenedNotebook, setCurrentNotebook } =
    useNotebookStore()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const handleHomeClick = () => {
    navigate('/')
  }

  const handleOpenedNotebookClick = (id: string) => {
    setCurrentNotebook(id)
    navigate(`/chat/${id}`)
  }

  const handleCloseOpenedNotebook = (id: string) => {
    // 如果关闭的是当前笔记本，需要跳转
    if (currentNotebook?.id === id && !isHomePage) {
      // 找到当前笔记本在列表中的索引
      const currentIndex = openedNotebooks.findIndex((nb) => nb.id === id)
      const otherNotebooks = openedNotebooks.filter((nb) => nb.id !== id)

      if (otherNotebooks.length > 0) {
        // 如果当前不是第一个，跳转到上一个；否则跳转到下一个
        const targetNotebook =
          currentIndex > 0 ? openedNotebooks[currentIndex - 1] : openedNotebooks[1]
        setCurrentNotebook(targetNotebook.id)
        navigate(`/chat/${targetNotebook.id}`)
      } else {
        // 没有其他笔记本，跳转到首页
        navigate('/')
      }
    }
    removeOpenedNotebook(id)
  }

  const handleSettingsClick = () => {
    setIsSettingsOpen(true)
  }

  const handleSettingsClose = () => {
    setIsSettingsOpen(false)
  }

  return (
    <>
      <div
        className="h-10 flex-shrink-0 flex items-center justify-between px-3"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
      {/* 左侧空白区域（留给窗口控制按钮） */}
      <div className="w-16"></div>

      {/* 导航按钮 */}
      <div
        className="flex items-center gap-2 flex-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={handleHomeClick}
          disabled={isHomePage}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors text-sm h-7 ${
            isHomePage ? 'bg-[#2a2a2a] cursor-default' : 'bg-[#2a2a2a] hover:bg-[#333333]'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>首页</span>
        </button>

        {/* 打开的笔记本标签 - 所有页面都显示 */}
        {openedNotebooks.map((notebook) => {
          const isActive = currentNotebook?.id === notebook.id
          return (
            <button
              key={notebook.id}
              onClick={() => handleOpenedNotebookClick(notebook.id)}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm h-7 transition-colors ${
                isActive && !isHomePage
                  ? 'bg-[#2a2a2a]'
                  : 'bg-[#2a2a2a] hover:bg-[#333333]'
              }`}
            >
              <span className="max-w-[200px] truncate">{notebook.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleCloseOpenedNotebook(notebook.id)
                }}
                className="ml-2 p-1 hover:bg-[#3a3a3a] rounded transition-colors"
                title="关闭标签"
              >
                <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-200" />
              </button>
            </button>
          )
        })}

        <button
          onClick={onCreateClick}
          className="flex items-center justify-center w-7 h-7 hover:bg-[#2a2a2a] rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 设置按钮 */}
      <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={handleSettingsClick}
          className="flex items-center justify-center w-7 h-7 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          title="设置"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>

      {/* 设置面板 */}
      <SettingsPanel isOpen={isSettingsOpen} onClose={handleSettingsClose} />
    </>
  )
}
