import { useState, useRef, useEffect, ReactElement } from 'react'
import { MoreVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Notebook } from '../../types/notebook'
import { Button } from '../ui/button'

interface NotebookCardProps {
  notebook: Notebook
  onClick: () => void
  onDelete: () => void
  onRename: () => void
}

// 主题图表颜色映射
const chartColors = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5']

// 根据笔记本 ID 获取颜色类名
const getColorClass = (id: string): string => {
  // 使用 ID 的字符码总和来确定颜色索引
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return chartColors[hash % 5]
}

export default function NotebookCard({
  notebook,
  onClick,
  onDelete,
  onRename
}: NotebookCardProps): ReactElement {
  const { t, i18n } = useTranslation('ui')
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 获取笔记本颜色
  const colorClass = getColorClass(notebook.id)

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

    if (days === 0) return t('today')
    if (days === 1) return t('yesterday')
    if (days < 7) return t('daysAgo', { days })

    // 使用当前语言格式化日期
    const locale = i18n.language === 'zh-CN' ? 'zh-CN' : 'en-US'
    return date.toLocaleDateString(locale)
  }

  return (
    <div
      onClick={onClick}
      className="group relative bg-card rounded-2xl p-8 min-h-[200px] cursor-pointer transition-all hover:bg-card/90 hover:scale-[1.02] border border-border/50 hover:border-border overflow-hidden shadow-md flex flex-col gap-2"
    >
      {/* 顶部彩色装饰条 - 使用主题图表颜色 */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${colorClass}`} />

      {/* 右上角菜单按钮 */}
      <div className="absolute top-4 right-4" ref={menuRef}>
        <Button
          onClick={handleMenuClick}
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-full opacity-0 group-hover:opacity-100"
        >
          <MoreVertical className="w-4 h-4" />
        </Button>

        {/* 下拉菜单 */}
        {showMenu && (
          <div className="absolute top-10 right-0 w-40 bg-card rounded-lg shadow-lg border border-border overflow-hidden z-10">
            <Button
              onClick={handleRename}
              variant="ghost"
              className="w-full justify-start text-sm font-normal rounded-none"
            >
              {t('renameNotebook')}
            </Button>
            <Button
              onClick={handleDelete}
              variant="ghost"
              className="w-full justify-start text-sm font-normal text-destructive hover:text-destructive rounded-none"
            >
              {t('deleteNotebook')}
            </Button>
          </div>
        )}
      </div>

      {/* 内容区域 - 使用 flex 布局让底部信息靠下 */}
      <div className="flex-1 flex flex-col gap-2">
        <h3 className="text-h2 text-foreground line-clamp-2">{notebook.title}</h3>

        {notebook.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{notebook.description}</p>
        )}
      </div>

      {/* 底部信息 - 自动靠底部对齐 */}
      <div className="flex items-center justify-end text-xs text-muted-foreground">
        <span>{formatDate(notebook.updatedAt)}</span>
      </div>

      {/* Hover 效果光晕 - 使用主题图表颜色 */}
      <div
        className={`absolute inset-0 rounded-2xl ${colorClass} opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none`}
      />
    </div>
  )
}
