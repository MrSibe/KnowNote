import { ReactElement, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
import { Placeholder } from '@tiptap/extensions'
import { ScrollArea } from '../../ui/scroll-area'

interface NoteEditorProps {
  content: string
  onChange: (content: string) => void
}

export default function NoteEditor({ content, onChange }: NoteEditorProps): ReactElement {
  const { t } = useTranslation('notebook')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Placeholder.configure({
        placeholder: t('startEditing', '输入笔记内容...')
      })
    ],
    content,
    editorProps: {
      attributes: {
        class: 'tiptap-editor prose prose-sm max-w-none focus:outline-none'
      }
    },
    onUpdate: ({ editor }) => {
      const markdown = (editor.storage as any).markdown.getMarkdown()
      onChange(markdown)
    }
  })

  // 清理编辑器实例
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy()
      }
    }
  }, [editor])

  // 当外部 content 变化时同步到编辑器
  useEffect(() => {
    if (editor && content !== (editor.storage as any).markdown.getMarkdown()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">加载中...</div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* 编辑器内容 */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <EditorContent editor={editor} />
        </div>
      </ScrollArea>

      <style>{`
        .ProseMirror {
          color: hsl(var(--foreground));
          background: transparent;
          min-height: 100%;
          outline: none;
          font-size: 0.875rem;
          line-height: 1.75;
        }

        .ProseMirror p.is-empty::before {
          color: hsl(var(--muted-foreground) / 0.5);
          content: attr(data-placeholder);
          pointer-events: none;
          float: left;
          height: 0;
        }

        .ProseMirror.is-editor-empty p::before {
          color: hsl(var(--muted-foreground) / 0.5);
          content: attr(data-placeholder);
          pointer-events: none;
          float: left;
          height: 0;
        }

              .ProseMirror p {
          margin: 0.75rem 0;
          color: hsl(var(--foreground));
        }

              .ProseMirror h1,
              .ProseMirror h2,
              .ProseMirror h3 {
          margin: 1rem 0 0.5rem;
          font-weight: 700;
          line-height: 1.4;
          color: hsl(var(--foreground));
        }

              .ProseMirror h1 {
          font-size: 1.25rem;
        }

              .ProseMirror h2 {
          font-size: 1.125rem;
        }

              .ProseMirror h3 {
          font-size: 1rem;
        }

              .ProseMirror code {
          background-color: hsl(var(--muted));
          color: hsl(var(--primary));
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
        }

              .ProseMirror pre {
          background-color: hsl(var(--muted));
          color: hsl(var(--foreground));
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }

              .ProseMirror pre code {
          background: none;
          padding: 0;
          color: inherit;
          font-size: 0.875rem;
        }

              .ProseMirror ul,
              .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.75rem 0;
          list-style-position: outside;
        }

              .ProseMirror ul {
          list-style-type: disc;
        }

              .ProseMirror ol {
          list-style-type: decimal;
        }

              .ProseMirror li {
          margin: 0.25rem 0;
          color: hsl(var(--foreground));
        }

              .ProseMirror li::marker {
          color: hsl(var(--foreground));
        }

              .ProseMirror a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }

              .ProseMirror a:hover {
          opacity: 0.8;
        }

              .ProseMirror blockquote {
          border-left: 3px solid hsl(var(--border));
          padding-left: 1rem;
          margin: 0.75rem 0;
          color: hsl(var(--muted-foreground));
        }

              .ProseMirror strong {
          font-weight: 600;
          color: hsl(var(--foreground));
        }

              .ProseMirror em {
          font-style: italic;
          color: hsl(var(--foreground));
        }
      `}</style>
    </div>
  )
}
