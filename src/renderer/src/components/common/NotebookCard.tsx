import { useState, useRef, useEffect, ReactElement } from 'react'
import { MessageSquare, MoreVertical } from 'lucide-react'
import type { Notebook } from '../../types/notebook'

interface NotebookCardProps {
  notebook: Notebook
  onClick: () => void
  onDelete: () => void
  onRename: () => void
}

export default function NotebookCard({
  notebook,
  onClick,
  onDelete,
  onRename
}: NotebookCardProps): ReactElement {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleMenuClick = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  const handleDelete = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setShowMenu(false)
    onDelete()
  }

  const handleRename = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setShowMenu(false)
    onRename()
  }

  const formatDate = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days} 天前`
    return date.toLocaleDateString('zh-CN')
  }

  return (
    <div
      onClick={onClick}
      className="group relative bg-card rounded-2xl p-8 min-h-[200px] cursor-pointer transition-all hover:bg-card/90 hover:scale-[1.02] border border-border/50 hover:border-border overflow-hidden"
    >
      {/* 顶部彩色装饰条 */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: notebook.coverColor }}
      />

      {/* 右上角菜单按钮 */}
      <div className="absolute top-4 right-4" ref={menuRef}>
        <button
          onClick={handleMenuClick}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-card hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* 下拉菜单 */}
        {showMenu && (
          <div className="absolute top-10 right-0 w-40 bg-card rounded-lg shadow-lg border border-border overflow-hidden z-10">
            <button
              onClick={handleRename}
              className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-accent transition-colors"
            >
              重命名笔记本
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2.5 text-left text-sm text-destructive hover:bg-accent transition-colors"
            >
              删除笔记本
            </button>
          </div>
        )}
      </div>

      {/* 内容区域 - 使用 flex 布局让底部信息靠下 */}
      <div className="mt-2 flex flex-col h-[calc(100%-1rem)]">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
            {notebook.title}
          </h3>

          {notebook.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {notebook.description}
            </p>
          )}
        </div>

        {/* 底部信息 - 自动靠底部对齐 */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/30">
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{notebook.chatCount} 条对话</span>
          </div>
          <span>{formatDate(notebook.updatedAt)}</span>
        </div>
      </div>

      {/* Hover 效果光晕 */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
        style={{ backgroundColor: notebook.coverColor }}
      />
    </div>
  )
}
