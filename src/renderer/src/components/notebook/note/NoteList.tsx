import { ReactElement } from 'react'
import { FileText, Trash2 } from 'lucide-react'
import type { Note } from '@/../../preload/index'

interface NoteListProps {
  notes: Note[]
  currentNote: Note | null
  onSelectNote: (note: Note) => void
  onDeleteNote: (noteId: string) => void
}

export default function NoteList({
  notes,
  currentNote,
  onSelectNote,
  onDeleteNote
}: NoteListProps): ReactElement {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <FileText className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">暂无笔记</p>
        <p className="text-xs text-muted-foreground mt-2">
          点击右上角的&ldquo;+&rdquo;按钮创建笔记
        </p>
      </div>
    )
  }

  return (
    <div className="p-2 space-y-1">
      {notes.map((note) => (
        <div
          key={note.id}
          className={`group p-3 rounded-lg transition-colors ${
            currentNote?.id === note.id
              ? 'bg-primary/10 border border-primary/20'
              : 'hover:bg-muted'
          }`}
        >
          <div className="flex items-start gap-2">
            <button onClick={() => onSelectNote(note)} className="flex-1 min-w-0 text-left">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">{note.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {note.content.replace(/^#.*\n/, '').slice(0, 100)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm('确定要删除这个笔记吗？')) {
                  onDeleteNote(note.id)
                }
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-all"
              title="删除笔记"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
