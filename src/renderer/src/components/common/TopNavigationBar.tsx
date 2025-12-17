import { Home, Plus, X, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useNotebookStore } from '../../store/notebookStore'
import { ReactElement, useEffect, useState } from 'react'
import { Button } from '../ui/button'

interface TopNavigationBarProps {
  onCreateClick: () => void
  isHomePage?: boolean
}

export default function TopNavigationBar({
  onCreateClick,
  isHomePage = false
}: TopNavigationBarProps): ReactElement {
  const { t } = useTranslation('ui')
  const navigate = useNavigate()
  const { currentNotebook, openedNotebooks, removeOpenedNotebook, setCurrentNotebook } =
    useNotebookStore()
  const [platform, setPlatform] = useState<string>('')

  // 获取平台信息
  useEffect(() => {
    const getPlatform = async () => {
      try {
        const platformName = await window.api.getPlatform()
        setPlatform(platformName)
      } catch (error) {
        console.error('Failed to get platform:', error)
      }
    }
    getPlatform()
  }, [])

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
      className="h-10 shrink-0 flex items-center justify-between px-3"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* macOS 左侧空白区域（留给窗口控制按钮） */}
      {platform === 'darwin' && <div className="w-16"></div>}

      {/* Linux 左侧设置按钮区域 */}
      {platform === 'linux' && (
        <div className="flex items-center">
          <Button
            onClick={handleSettingsClick}
            variant="ghost"
            size="icon"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className="w-7 h-7"
            title={t('settings')}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* 导航按钮 */}
      <div className="flex items-center gap-2 flex-1">
        <Button
          onClick={handleHomeClick}
          disabled={isHomePage}
          variant={isHomePage ? 'ghost' : 'outline'}
          size="sm"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          className="h-7 gap-2 shadow-sm"
        >
          <Home className="w-4 h-4" />
          <span>{t('home')}</span>
        </Button>

        {/* 打开的笔记本标签 - 所有页面都显示 */}
        {openedNotebooks.map((notebook) => {
          const isActive = currentNotebook?.id === notebook.id
          return (
            <Button
              key={notebook.id}
              onClick={() => handleOpenedNotebookClick(notebook.id)}
              variant={isActive && !isHomePage ? 'ghost' : 'outline'}
              size="sm"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              className="h-7 gap-1 shadow-sm"
            >
              <span className="max-w-[200px] truncate">{notebook.title}</span>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  handleCloseOpenedNotebook(notebook.id)
                }}
                variant="ghost"
                size="icon"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                className="ml-2 h-auto w-auto p-1"
                title={t('closeTab')}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </Button>
          )
        })}

        <Button
          onClick={onCreateClick}
          variant="ghost"
          size="icon"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          className="w-7 h-7"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* 非Linux平台的设置按钮（Windows和macOS保持在右侧） */}
      {platform !== 'linux' && (
        <Button
          onClick={handleSettingsClick}
          variant="ghost"
          size="icon"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          className="w-7 h-7"
          title={t('settings')}
        >
          <Settings className="w-4 h-4" />
        </Button>
      )}

      {/* Windows 右侧空白区域（留给窗口控制按钮） */}
      {platform === 'win32' && <div className="w-32"></div>}
    </div>
  )
}
