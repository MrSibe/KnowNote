import { ReactElement } from 'react'
import { FileText } from 'lucide-react'
import type { Note } from '@/../../preload/index'

interface NoteListProps {
  notes: Note[]
  currentNote: Note | null
  onSelectNote: (note: Note) => void
}

export default function NoteList({
  notes,
  currentNote,
  onSelectNote
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
        <button
          key={note.id}
          onClick={() => onSelectNote(note)}
          className={`w-full text-left p-3 rounded-lg transition-colors ${
            currentNote?.id === note.id
              ? 'bg-primary/10 border border-primary/20'
              : 'hover:bg-muted'
          }`}
        >
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
      ))}
    </div>
  )
}
