import { useState, useEffect, useCallback, ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, FileText, Globe, FileUp, Loader2, StickyNote, X } from 'lucide-react'
import { useKnowledgeStore, setupKnowledgeListeners } from '../../store/knowledgeStore'
import { useNoteStore } from '../../store/noteStore'
import { ScrollArea } from '../ui/scroll-area'
import DocumentList from './source/DocumentList'

// 添加来源类型
type AddSourceType = 'file' | 'url' | 'text' | 'note'

// 添加来源弹窗组件
interface AddSourceModalProps {
  type: AddSourceType
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title?: string; content?: string; url?: string; noteId?: string }) => void
  isLoading: boolean
  notes: { id: string; title: string }[]
}

function AddSourceModal({
  type,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  notes
}: AddSourceModalProps) {
  const { t } = useTranslation('ui')
  // 状态会在组件重新挂载时自动重置（通过父组件的 key 属性）
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [selectedNoteId, setSelectedNoteId] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (type === 'url' && url) {
      onSubmit({ url })
    } else if (type === 'text' && title && content) {
      onSubmit({ title, content })
    } else if (type === 'note' && selectedNoteId) {
      onSubmit({ noteId: selectedNoteId })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl p-6 w-[480px] max-w-[90vw] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">
            {type === 'url' && t('importUrl')}
            {type === 'text' && t('pasteText')}
            {type === 'note' && t('importNote')}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {type === 'url' && (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t('urlPlaceholder')}
              className="w-full px-3 py-2 rounded-lg bg-muted border border-border outline-none focus:ring-2 focus:ring-primary/50"
              required
              autoFocus
            />
          )}

          {type === 'text' && (
            <>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('documentTitle')}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border outline-none focus:ring-2 focus:ring-primary/50 mb-3"
                required
                autoFocus
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('textPlaceholder')}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border outline-none focus:ring-2 focus:ring-primary/50 min-h-[200px] resize-none"
                required
              />
            </>
          )}

          {type === 'note' && (
            <select
              value={selectedNoteId}
              onChange={(e) => setSelectedNoteId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-muted border border-border outline-none focus:ring-2 focus:ring-primary/50"
              required
            >
              <option value="">{t('selectSession')}</option>
              {notes.map((note) => (
                <option key={note.id} value={note.id}>
                  {note.title}
                </option>
              ))}
            </select>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? t('processing') : t('add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// 索引进度条组件
function IndexingProgress() {
  const { indexProgress, isIndexing } = useKnowledgeStore()

  if (!isIndexing || !indexProgress) return null

  return (
    <div className="px-4 py-2 bg-primary/10 border-b border-border">
      <div className="flex items-center gap-2 text-xs text-primary">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>{indexProgress.stage}</span>
        <span>{indexProgress.progress}%</span>
      </div>
      <div className="mt-1 h-1 bg-primary/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${indexProgress.progress}%` }}
        />
      </div>
    </div>
  )
}

export default function SourcePanel(): ReactElement {
  const { t } = useTranslation('ui')
  const { id: notebookId } = useParams()
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [modalType, setModalType] = useState<AddSourceType | null>(null)

  const {
    documents,
    isLoading,
    isIndexing,
    loadDocuments,
    loadStats,
    addDocument,
    addDocumentFromFile,
    addDocumentFromUrl,
    addNoteToKnowledge,
    deleteDocument,
    selectFiles
  } = useKnowledgeStore()

  const { notes, loadNotes } = useNoteStore()

  // 设置监听器
  useEffect(() => {
    const cleanup = setupKnowledgeListeners()
    return cleanup
  }, [])

  // 加载文档和笔记
  useEffect(() => {
    if (notebookId) {
      loadDocuments(notebookId)
      loadStats(notebookId)
      loadNotes(notebookId)
    }
  }, [notebookId, loadDocuments, loadStats, loadNotes])

  // 处理文件上传
  const handleFileUpload = useCallback(async () => {
    if (!notebookId) return
    const files = await selectFiles()
    for (const filePath of files) {
      await addDocumentFromFile(notebookId, filePath)
    }
    setShowAddMenu(false)
  }, [notebookId, selectFiles, addDocumentFromFile])

  // 处理 URL 导入
  const handleUrlImport = useCallback(
    async (data: { url?: string }) => {
      if (!notebookId || !data.url) return
      await addDocumentFromUrl(notebookId, data.url)
      setModalType(null)
    },
    [notebookId, addDocumentFromUrl]
  )

  // 处理文本粘贴
  const handleTextPaste = useCallback(
    async (data: { title?: string; content?: string }) => {
      if (!notebookId || !data.title || !data.content) return
      await addDocument(notebookId, {
        title: data.title,
        type: 'text',
        content: data.content
      })
      setModalType(null)
    },
    [notebookId, addDocument]
  )

  // 处理笔记导入
  const handleNoteImport = useCallback(
    async (data: { noteId?: string }) => {
      if (!notebookId || !data.noteId) return
      await addNoteToKnowledge(notebookId, data.noteId)
      setModalType(null)
    },
    [notebookId, addNoteToKnowledge]
  )

  // 处理删除文档
  const handleDelete = useCallback(
    async (documentId: string) => {
      if (!notebookId) return
      await deleteDocument(notebookId, documentId)
    },
    [notebookId, deleteDocument]
  )

  // 处理弹窗提交
  const handleModalSubmit = useCallback(
    (data: { title?: string; content?: string; url?: string; noteId?: string }) => {
      if (modalType === 'url') {
        handleUrlImport(data)
      } else if (modalType === 'text') {
        handleTextPaste(data)
      } else if (modalType === 'note') {
        handleNoteImport(data)
      }
    },
    [modalType, handleUrlImport, handleTextPaste, handleNoteImport]
  )

  return (
    <div className="flex flex-col bg-card rounded-xl overflow-hidden h-full">
      {/* 顶部工具栏 */}
      <div
        className="h-14 flex items-center justify-between px-4 border-b border-border/50"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <span className="text-sm text-foreground">{t('knowledgeBase')}</span>
        <div className="relative" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
            title={t('addSource')}
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* 添加菜单 */}
          {showAddMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-10">
              <button
                onClick={handleFileUpload}
                className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
              >
                <FileUp className="w-4 h-4" />
                {t('uploadFile')}
              </button>
              <button
                onClick={() => {
                  setModalType('url')
                  setShowAddMenu(false)
                }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                {t('importUrl')}
              </button>
              <button
                onClick={() => {
                  setModalType('text')
                  setShowAddMenu(false)
                }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                {t('pasteText')}
              </button>
              <button
                onClick={() => {
                  setModalType('note')
                  setShowAddMenu(false)
                }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
              >
                <StickyNote className="w-4 h-4" />
                {t('importNote')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 索引进度 */}
      <IndexingProgress />

      {/* 文档列表 */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <DocumentList documents={documents} onDeleteDocument={handleDelete} />
        </ScrollArea>
      )}

      {/* 添加来源弹窗 - 使用 key 强制在 type 变化时重新挂载组件 */}
      {modalType && modalType !== 'file' && (
        <AddSourceModal
          key={modalType}
          type={modalType}
          isOpen={true}
          onClose={() => setModalType(null)}
          onSubmit={handleModalSubmit}
          isLoading={isIndexing}
          notes={notes.map((n) => ({ id: n.id, title: n.title }))}
        />
      )}

      {/* 点击外部关闭菜单 */}
      {showAddMenu && <div className="fixed inset-0 z-0" onClick={() => setShowAddMenu(false)} />}
    </div>
  )
}
