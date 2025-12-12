import { Home, Plus, X, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotebookStore } from '../../store/notebookStore'
import { ReactElement } from 'react'

interface TopNavigationBarProps {
  onCreateClick: () => void
  isHomePage?: boolean
}

export default function TopNavigationBar({
  onCreateClick,
  isHomePage = false
}: TopNavigationBarProps): ReactElement {
  const navigate = useNavigate()
  const { currentNotebook, openedNotebooks, removeOpenedNotebook, setCurrentNotebook } =
    useNotebookStore()

  const handleHomeClick = (): void => {
    navigate('/')
  }

  const handleOpenedNotebookClick = (id: string): void => {
    setCurrentNotebook(id)
    navigate(`/notebook/${id}`)
  }

  const handleCloseOpenedNotebook = (id: string): void => {
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
        navigate(`/notebook/${targetNotebook.id}`)
      } else {
        // 没有其他笔记本，跳转到首页
        navigate('/')
      }
    }
    removeOpenedNotebook(id)
  }

  const handleSettingsClick = async (): Promise<void> => {
    try {
      await window.api.openSettings()
    } catch (error) {
      console.error('Failed to open settings:', error)
    }
  }

  return (
    <div
      className="h-10 flex-shrink-0 flex items-center justify-between px-3"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* 左侧空白区域（留给窗口控制按钮） */}
      <div className="w-16"></div>

      {/* 导航按钮 */}
      <div className="flex items-center gap-2 flex-1">
        <button
          onClick={handleHomeClick}
          disabled={isHomePage}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors text-sm h-7 ${
            isHomePage ? 'bg-card cursor-default' : 'bg-card hover:bg-accent'
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
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm h-7 transition-colors ${
                isActive && !isHomePage ? 'bg-card' : 'bg-card hover:bg-accent'
              }`}
            >
              <span className="max-w-[200px] truncate">{notebook.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleCloseOpenedNotebook(notebook.id)
                }}
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                className="ml-2 p-1 hover:bg-accent rounded transition-colors"
                title="关闭标签"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            </button>
          )
        })}

        <button
          onClick={onCreateClick}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          className="flex items-center justify-center w-7 h-7 hover:bg-accent rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 设置按钮 */}
      <button
        onClick={handleSettingsClick}
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        className="flex items-center justify-center w-7 h-7 hover:bg-accent rounded-lg transition-colors"
        title="设置"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  )
}
