import { ReactElement, useEffect, useState } from 'react'
import { Plus, Save, Trash2, ArrowLeft } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useNoteStore } from '../../store/noteStore'
import NoteEditor from './note/NoteEditor'
import NoteList from './note/NoteList'
import { ScrollArea } from '../ui/scroll-area'
import type { Note } from '@/../../preload/index'

// 编辑器面板子组件 - 管理编辑状态
interface NoteEditorPanelProps {
  note: Note
  isSaving: boolean
  onSave: (title: string, content: string) => void
  onDelete: () => void
  onBack: () => void
}

function NoteEditorPanel({ note, isSaving, onSave, onDelete, onBack }: NoteEditorPanelProps) {
  const [editTitle, setEditTitle] = useState(note.title)
  const [editContent, setEditContent] = useState(note.content)

  const handleSave = () => {
    onSave(editTitle, editContent)
  }

  return (
    <>
      {/* 顶部工具栏 */}
      <div
        className="h-14 flex items-center justify-between px-4 border-b border-border/50"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            title="返回列表"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-sm font-medium outline-none"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            placeholder="笔记标题"
          />
        </div>
        <div
          className="flex items-center gap-2 flex-shrink-0"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
            title="保存"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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
  const { id: notebookId } = useParams()
  const {
    notes,
    currentNote,
    isEditing,
    isSaving,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    setCurrentNote
  } = useNoteStore()

  // 加载笔记列表
  useEffect(() => {
    if (notebookId) {
      loadNotes(notebookId)
    }
  }, [notebookId, loadNotes])

  // 创建新笔记
  const handleCreateNote = async () => {
    if (!notebookId) return
    await createNote(notebookId, '# 新笔记\n\n开始编辑...', '新笔记')
  }

  // 保存笔记
  const handleSave = async (title: string, content: string) => {
    if (!currentNote) return
    await updateNote(currentNote.id, { title, content })
  }

  // 删除笔记
  const handleDelete = async () => {
    if (!currentNote) return
    if (confirm('确定要删除这个笔记吗？')) {
      await deleteNote(currentNote.id)
    }
  }

  // 返回列表页面
  const handleBack = () => {
    setCurrentNote(null)
  }

  return (
    <div className="flex flex-col bg-card rounded-xl overflow-hidden h-full">
      {isEditing && currentNote ? (
        // 编辑器页面 - 使用 key 强制在切换笔记时重新挂载
        <NoteEditorPanel
          key={currentNote.id}
          note={currentNote}
          isSaving={isSaving}
          onSave={handleSave}
          onDelete={handleDelete}
          onBack={handleBack}
        />
      ) : (
        // 列表页面
        <>
          {/* 顶部工具栏 */}
          <div
            className="h-14 flex items-center justify-between px-4 border-b border-border/50"
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
          >
            <span className="text-sm text-foreground">笔记</span>
            <button
              onClick={handleCreateNote}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              title="创建笔记"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* 笔记列表 */}
          <ScrollArea className="flex-1">
            <NoteList notes={notes} currentNote={currentNote} onSelectNote={setCurrentNote} />
          </ScrollArea>
        </>
      )}
    </div>
  )
}
