import { ReactElement, useEffect, useState } from 'react'
import { Save, Trash2, ArrowLeft, Network, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useItemStore } from '../../store/itemStore'
import { setupMindMapListeners } from '../../store/mindmapStore'
import NoteEditor from './note/NoteEditor'
import ItemList from './item/ItemList'
import { ScrollArea } from '../ui/scroll-area'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import type { Note } from '../../../../shared/types'

// 编辑器面板子组件 - 管理编辑状态
interface NoteEditorPanelProps {
  note: Note
  isSaving: boolean
  onSave: (title: string, content: string) => void
  onDelete: () => void
  onBack: () => void
  hasUnsavedChanges: boolean
  onUnsavedChange: (hasChanges: boolean) => void
}

function NoteEditorPanel({
  note,
  isSaving,
  onSave,
  onDelete,
  onBack,
  onUnsavedChange
}: NoteEditorPanelProps) {
  const { t } = useTranslation('notebook')
  const [editTitle, setEditTitle] = useState(note.title)
  const [editContent, setEditContent] = useState(note.content)

  // 检测是否有未保存的修改
  useEffect(() => {
    const hasChanges = editTitle !== note.title || editContent !== note.content
    onUnsavedChange(hasChanges)
  }, [editTitle, editContent, note.title, note.content, onUnsavedChange])

  const handleSave = () => {
    // 如果标题为空或只有空格，使用默认标题
    const finalTitle = editTitle.trim() || t('untitledNote')
    // 更新显示的标题，让用户看到自动设置的标题
    if (!editTitle.trim()) {
      setEditTitle(finalTitle)
    }
    onSave(finalTitle, editContent)
  }

  return (
    <>
      {/* 顶部工具栏 */}
      <div
        className="h-14 flex items-center justify-between px-4 border-b border-border/50"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="w-8 h-8 shrink-0"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            title={t('backToList')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="flex-1 min-w-0 bg-transparent border-0 text-sm font-medium p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            placeholder={t('noteTitle')}
          />
        </div>
        <div
          className="flex items-center gap-2 shrink-0"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <Button
            onClick={handleSave}
            disabled={isSaving}
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            title={t('save')}
          >
            <Save className="w-4 h-4" />
          </Button>
          <Button
            onClick={onDelete}
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            title={t('delete')}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 编辑器内容 */}
      <div className="flex-1 overflow-hidden">
        <NoteEditor content={editContent} onChange={setEditContent} />
      </div>
    </>
  )
}

export default function NotePanel(): ReactElement {
  const { t } = useTranslation('notebook')
  const { id: notebookId } = useParams()
  const {
    items,
    currentNote,
    isEditing,
    isSaving,
    loadItems,
    createNote,
    updateNote,
    deleteItem,
    setCurrentNote
  } = useItemStore()

  // 管理未保存状态
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // 监听Notebook切换，清空当前编辑状态
  useEffect(() => {
    if (notebookId) {
      // 清空当前编辑状态，避免显示旧Notebook的内容
      setCurrentNote(null)
      // 使用 setTimeout 将状态更新推迟到下一个事件循环
      setTimeout(() => setHasUnsavedChanges(false), 0)
    }
  }, [notebookId, setCurrentNote])

  // 设置思维导图进度监听器
  useEffect(() => {
    const unsubscribe = setupMindMapListeners()
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  // 加载 items 列表
  useEffect(() => {
    if (notebookId) {
      loadItems(notebookId)
    }
  }, [notebookId, loadItems])

  // 创建新笔记
  const handleCreateNote = async () => {
    if (!notebookId) return
    await createNote(notebookId, t('newNoteContent'), t('newNote'))
  }

  // 保存笔记
  const handleSave = async (title: string, content: string) => {
    if (!currentNote) return
    await updateNote(currentNote.id, { title, content })
  }

  // 删除笔记
  const handleDelete = async () => {
    if (!currentNote) return
    if (confirm(t('confirmDeleteNote'))) {
      // 找到对应的 item
      const item = items.find((item) => item.type === 'note' && item.resourceId === currentNote.id)
      if (item) {
        await deleteItem(item.id, true) // 同时删除资源
      }
    }
  }

  // 返回列表页面
  const handleBack = () => {
    // 如果有未保存的修改，提示用户
    if (hasUnsavedChanges) {
      const message = t('unsavedChangesWarning', '您有未保存的修改，确定要离开吗？')
      if (!confirm(message)) {
        return
      }
    }
    setCurrentNote(null)
    setHasUnsavedChanges(false)
  }

  // 打开思维导图窗口（查看特定版本）
  const handleOpenMindMap = async (mindMapId: string) => {
    try {
      if (notebookId) {
        await window.api.mindmap.openWindow(notebookId, mindMapId)
      }
    } catch (error) {
      console.error('[NotePanel] Failed to open mind map window:', error)
    }
  }

  // 生成新思维导图（在后台生成，不打开窗口）
  const handleGenerateMindMap = async () => {
    if (notebookId) {
      try {
        // 立即开始生成（异步）
        window.api.mindmap.generate(notebookId).then((result) => {
          if (result.success) {
            // 生成完成后重新加载列表
            loadItems(notebookId)
          }
        })

        // 等待一小段时间后刷新列表，以显示"正在生成"的 item
        setTimeout(() => {
          loadItems(notebookId)
        }, 500)
      } catch (error) {
        console.error('[NotePanel] Failed to generate mind map:', error)
      }
    }
  }

  return (
    <div className="flex flex-col bg-card rounded-xl overflow-hidden h-full shadow-md">
      {isEditing && currentNote ? (
        // 编辑器页面 - 使用 key 强制在切换笔记时重新挂载
        <NoteEditorPanel
          key={currentNote.id}
          note={currentNote}
          isSaving={isSaving}
          onSave={handleSave}
          onDelete={handleDelete}
          onBack={handleBack}
          hasUnsavedChanges={hasUnsavedChanges}
          onUnsavedChange={setHasUnsavedChanges}
        />
      ) : (
        // 列表页面
        <>
          {/* 顶部工具栏 */}
          <div
            className="h-14 flex items-center justify-between px-4 border-b border-border/50"
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
          >
            <span className="text-sm text-foreground">{t('creativeSpace')}</span>
            <div
              className="flex items-center gap-2"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
              <Button
                onClick={handleGenerateMindMap}
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                title={t('generateMindMap')}
              >
                <Network className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleCreateNote}
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                title={t('createNote')}
              >
                <FileText className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Items 列表（笔记 + 思维导图等） */}
          <ScrollArea className="flex-1">
            <ItemList
              items={items}
              currentNote={currentNote}
              onSelectNote={setCurrentNote}
              onOpenMindMap={handleOpenMindMap}
              onDeleteItem={(itemId) => deleteItem(itemId, true)}
            />
          </ScrollArea>
        </>
      )}
    </div>
  )
}
