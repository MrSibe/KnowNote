import { ReactElement } from 'react'
import { BookOpen, Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Notebook } from '../../types/notebook'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card'
import { Button } from '../ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '../ui/context-menu'

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

  // 获取笔记本颜色
  const colorClass = getColorClass(notebook.id)

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
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Card
          onClick={onClick}
          className="group relative min-h-[200px] cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg border-border/50 hover:border-border overflow-hidden flex flex-col"
        >
          {/* 顶部彩色装饰条 - 使用主题图表颜色 */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${colorClass}`} />

          {/* Hover 效果光晕 - 使用主题图表颜色 */}
          <div
            className={`absolute inset-0 ${colorClass} opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none`}
          />

          <CardHeader className="flex-1 pb-4">
            <CardTitle className="flex items-center gap-2 text-h2 line-clamp-2">
              <BookOpen className={`w-5 h-5 shrink-0 ${colorClass.replace('bg-', 'text-').replace('-500', '-600')}`} />
              <span>{notebook.title}</span>
            </CardTitle>
            {notebook.description && (
              <CardDescription className="line-clamp-2">{notebook.description}</CardDescription>
            )}
          </CardHeader>

          <CardContent className="pb-4">
            {/* 可以在这里添加笔记本预览内容 */}
          </CardContent>

          <CardFooter className="justify-between items-center border-t border-border/50 pt-4">
            <span className="text-xs text-muted-foreground">{formatDate(notebook.updatedAt)}</span>

            {/* 悬停时显示的操作按钮 */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onRename()
                }}
                className="h-8 w-8 p-0"
                title={t('renameNotebook')}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                title={t('deleteNotebook')}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </ContextMenuTrigger>

      {/* 右键菜单 */}
      <ContextMenuContent>
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation()
            onRename()
          }}
        >
          <Pencil className="w-4 h-4 mr-2" />
          {t('renameNotebook')}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {t('deleteNotebook')}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
