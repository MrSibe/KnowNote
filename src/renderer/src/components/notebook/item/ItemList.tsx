import { ReactElement, useState, useEffect } from 'react'
import { FileText, Network, Trash2, Loader2, GripVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import type { Note } from '../../../../../shared/types'
import type { ItemDetail } from '../../../store/itemStore'
import { Button } from '../../ui/button'

interface ItemListProps {
  items: ItemDetail[]
  currentNote: Note | null
  onSelectNote: (note: Note) => void
  onOpenMindMap: (mindMapId: string) => void
  onDeleteItem: (itemId: string) => void
}

// 单个可排序的 Item 组件
function SortableItemRow({
  item,
  currentNote,
  onSelectNote,
  onOpenMindMap,
  onDeleteItem,
  t,
  i18n
}: {
  item: ItemDetail
  currentNote: Note | null
  onSelectNote: (note: Note) => void
  onOpenMindMap: (mindMapId: string) => void
  onDeleteItem: (itemId: string) => void
  t: any
  i18n: any
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: item.id
  })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 999 : undefined
  }

  const isNote = item.type === 'note'
  const isMindMap = item.type === 'mindmap'
  const note = isNote ? (item.resource as Note) : null
  const mindMap = isMindMap ? item.resource : null
  const isCurrentNote = isNote && currentNote?.id === item.resourceId
  const isGenerating = isMindMap && mindMap?.status === 'generating'
  const isFailed = isMindMap && mindMap?.status === 'failed'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={() => {
        if (isNote && note) {
          onSelectNote(note)
        } else if (isMindMap && mindMap && !isGenerating) {
          onOpenMindMap(mindMap.id)
        }
      }}
      className={`group grid grid-cols-[auto_1fr_auto] gap-2 items-start p-3 rounded-lg border ${isDragging ? 'cursor-grabbing opacity-75' : 'cursor-pointer'} ${
        isGenerating
          ? 'bg-chart-1/5 border-chart-1/30 animate-pulse cursor-wait'
          : isFailed
            ? 'bg-destructive/5 border-destructive/30'
            : isCurrentNote
              ? 'bg-primary/10 border-primary/20 cursor-pointer'
              : 'border-transparent hover:bg-muted cursor-pointer'
      }`}
    >
      {/* 图标和拖拽手柄列 - 固定宽度，垂直布局 */}
      <div className="flex flex-col items-center gap-0.5">
        {/* 图标 */}
        {isNote && <FileText className="w-4 h-4 text-muted-foreground" />}
        {isMindMap && !isGenerating && <Network className="w-4 h-4 text-chart-1" />}
        {isMindMap && isGenerating && <Loader2 className="w-4 h-4 text-chart-1 animate-spin" />}

        {/* 拖拽手柄 */}
        <div
          ref={setActivatorNodeRef}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* 内容列 - 可被压缩 */}
      <div className="min-w-0 flex flex-col gap-1">
        {isNote && note && (
          <>
            <h3 className="text-sm font-medium truncate">{note.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {note.content.replace(/^#.*\n/, '').slice(0, 100)}
            </p>
          </>
        )}
        {isMindMap && mindMap && (
          <>
            <h3 className="text-sm font-medium truncate flex items-center gap-2">
              {mindMap.title}
              {mindMap.status === 'generating' && (
                <span className="text-xs text-muted-foreground">{t('generating')}</span>
              )}
              {mindMap.status === 'failed' && (
                <span className="text-xs text-destructive">{t('failed')}</span>
              )}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('mindMapVersion', { version: mindMap.version })}
            </p>
          </>
        )}
        <p className="text-xs text-muted-foreground">
          {new Date(item.updatedAt).toLocaleDateString(
            i18n.language === 'zh-CN' ? 'zh-CN' : 'en-US'
          )}
        </p>
      </div>

      {/* 删除按钮列 - 固定宽度 */}
      <Button
        onClick={(e) => {
          e.stopPropagation()
          const confirmMsg = isNote ? t('confirmDeleteNote') : t('confirmDeleteMindMap')
          if (confirm(confirmMsg)) {
            onDeleteItem(item.id)
          }
        }}
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 w-8 h-8 mt-0.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
        title={isNote ? t('deleteNote') : t('deleteMindMap')}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}

export default function ItemList({
  items,
  currentNote,
  onSelectNote,
  onOpenMindMap,
  onDeleteItem
}: ItemListProps): ReactElement {
  const { t, i18n } = useTranslation('notebook')
  const [localItems, setLocalItems] = useState(items)

  // 配置传感器 - 避免轻微抖动触发拖拽
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    })
  )

  // 处理拖拽结束
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = localItems.findIndex((item) => item.id === active.id)
      const newIndex = localItems.findIndex((item) => item.id === over.id)

      const newItems = arrayMove(localItems, oldIndex, newIndex)
      setLocalItems(newItems)

      // 批量更新 order 值
      const updates: Record<string, number> = {}
      newItems.forEach((item, index) => {
        updates[item.id] = index
      })

      try {
        await window.api.items.batchUpdateOrder(updates)
      } catch (error) {
        console.error('Failed to update item order:', error)
        // 如果更新失败，恢复原来的顺序
        setLocalItems(items)
      }
    }
  }

  // 当外部 items 改变时，更新本地状态
  useEffect(() => {
    setLocalItems(items)
  }, [items])

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-4">
        <FileText className="w-12 h-12 text-muted-foreground" />
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{t('noNotesYet')}</p>
          <p className="text-xs text-muted-foreground">{t('noNotesYetDesc')}</p>
        </div>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={localItems.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="p-2 space-y-1 select-none">
          {localItems.map((item) => (
            <SortableItemRow
              key={item.id}
              item={item}
              currentNote={currentNote}
              onSelectNote={onSelectNote}
              onOpenMindMap={onOpenMindMap}
              onDeleteItem={onDeleteItem}
              t={t}
              i18n={i18n}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
