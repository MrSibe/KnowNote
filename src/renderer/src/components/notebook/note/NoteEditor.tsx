import { ReactElement, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
import { Bold, Italic, Link as LinkIcon, Code, FileCode, List, ListOrdered } from 'lucide-react'

interface NoteEditorProps {
  content: string
  onChange: (content: string) => void
}

export default function NoteEditor({ content, onChange }: NoteEditorProps): ReactElement {
  const editor = useEditor({
    extensions: [StarterKit, Markdown],
    content,
    editorProps: {
      attributes: {
        class: 'tiptap-editor prose prose-sm max-w-none focus:outline-none'
      }
    },
    onUpdate: ({ editor }) => {
      const markdown = editor.storage.markdown.getMarkdown()
      onChange(markdown)
    }
  })

  useEffect(() => {
    if (editor && content !== editor.storage.markdown.getMarkdown()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">加载中...</div>
    )
  }

  return (
    <div className="h-full flex flex-col note-editor-wrapper">
      {/* 工具栏 */}
      <div className="toolbar flex items-center gap-1 p-2 border-b border-border/50">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
          title="加粗"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
          title="斜体"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-border/50 mx-1" />

        <button
          onClick={() => {
            const url = window.prompt('输入链接地址:')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
          className={`toolbar-btn ${editor.isActive('link') ? 'active' : ''}`}
          title="链接"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`toolbar-btn ${editor.isActive('code') ? 'active' : ''}`}
          title="行内代码"
        >
          <Code className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`toolbar-btn ${editor.isActive('codeBlock') ? 'active' : ''}`}
          title="代码块"
        >
          <FileCode className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-border/50 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
          title="无序列表"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
          title="有序列表"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      {/* 编辑器内容 */}
      <div className="flex-1 overflow-y-auto p-4">
        <EditorContent editor={editor} />
      </div>

      <style>{`
        .note-editor-wrapper .toolbar-btn {
          padding: 0.375rem;
          color: hsl(var(--muted-foreground));
          border-radius: 0.375rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .note-editor-wrapper .toolbar-btn:hover {
          color: hsl(var(--foreground));
          background-color: hsl(var(--muted));
        }

        .note-editor-wrapper .toolbar-btn.active {
          color: hsl(var(--foreground));
          background-color: hsl(var(--primary) / 0.1);
        }

        .note-editor-wrapper .ProseMirror {
          color: hsl(var(--foreground));
          background: transparent;
          min-height: 100%;
          outline: none;
        }

        .note-editor-wrapper .ProseMirror p {
          margin: 0.75rem 0;
          color: hsl(var(--foreground));
        }

        .note-editor-wrapper .ProseMirror h1,
        .note-editor-wrapper .ProseMirror h2,
        .note-editor-wrapper .ProseMirror h3 {
          margin: 1rem 0 0.5rem;
          font-weight: 600;
          line-height: 1.25;
          color: hsl(var(--foreground));
        }

        .note-editor-wrapper .ProseMirror h1 {
          font-size: 1.875rem;
        }

        .note-editor-wrapper .ProseMirror h2 {
          font-size: 1.5rem;
        }

        .note-editor-wrapper .ProseMirror h3 {
          font-size: 1.25rem;
        }

        .note-editor-wrapper .ProseMirror code {
          background-color: hsl(var(--muted));
          color: hsl(var(--foreground));
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: 'Courier New', monospace;
        }

        .note-editor-wrapper .ProseMirror pre {
          background-color: hsl(var(--muted));
          color: hsl(var(--foreground));
          padding: 0.75rem 1rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          margin: 0.75rem 0;
        }

        .note-editor-wrapper .ProseMirror pre code {
          background: none;
          padding: 0;
          color: inherit;
          font-size: 0.875rem;
        }

        .note-editor-wrapper .ProseMirror ul,
        .note-editor-wrapper .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.75rem 0;
          list-style-position: outside;
        }

        .note-editor-wrapper .ProseMirror ul {
          list-style-type: disc;
        }

        .note-editor-wrapper .ProseMirror ol {
          list-style-type: decimal;
        }

        .note-editor-wrapper .ProseMirror li {
          margin: 0.25rem 0;
          color: hsl(var(--foreground));
        }

        .note-editor-wrapper .ProseMirror li::marker {
          color: hsl(var(--foreground));
        }

        .note-editor-wrapper .ProseMirror a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }

        .note-editor-wrapper .ProseMirror a:hover {
          opacity: 0.8;
        }

        .note-editor-wrapper .ProseMirror blockquote {
          border-left: 3px solid hsl(var(--border));
          padding-left: 1rem;
          margin: 0.75rem 0;
          color: hsl(var(--muted-foreground));
        }

        .note-editor-wrapper .ProseMirror strong {
          font-weight: 600;
          color: hsl(var(--foreground));
        }

        .note-editor-wrapper .ProseMirror em {
          font-style: italic;
          color: hsl(var(--foreground));
        }
      `}</style>
    </div>
  )
}
