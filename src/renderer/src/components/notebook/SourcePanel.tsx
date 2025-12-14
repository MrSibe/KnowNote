import { useState, useEffect, useCallback, ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, FileText, Globe, FileUp, Loader2, StickyNote, ArrowLeft } from 'lucide-react'
import { useKnowledgeStore, setupKnowledgeListeners } from '../../store/knowledgeStore'
import { useNoteStore } from '../../store/noteStore'
import { ScrollArea } from '../ui/scroll-area'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import DocumentList from './source/DocumentList'
import type { KnowledgeDocument } from '../../../../shared/types/knowledge'

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

  // 判断是否可以提交
  const canSubmit =
    !isLoading &&
    ((type === 'url' && url.trim()) ||
      (type === 'text' && title.trim() && content.trim()) ||
      (type === 'note' && selectedNoteId))

  const getTitle = () => {
    if (type === 'url') return t('importUrl')
    if (type === 'text') return t('pasteText')
    if (type === 'note') return t('importNote')
    return ''
  }

  return (
    <Dialog open={isOpen} onOpenChange={isLoading ? undefined : onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {type === 'url' && (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t('urlPlaceholder')}
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground text-base focus:outline-none focus:ring-2 focus:ring-ring transition-colors placeholder-muted-foreground"
              required
              autoFocus
              disabled={isLoading}
            />
          )}

          {type === 'text' && (
            <div className="space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('documentTitle')}
                className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground text-base focus:outline-none focus:ring-2 focus:ring-ring transition-colors placeholder-muted-foreground"
                required
                autoFocus
                disabled={isLoading}
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('textPlaceholder')}
                className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground text-base focus:outline-none focus:ring-2 focus:ring-ring transition-colors placeholder-muted-foreground min-h-60 resize-y"
                required
                disabled={isLoading}
              />
            </div>
          )}

          {type === 'note' && (
            <select
              value={selectedNoteId}
              onChange={(e) => setSelectedNoteId(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground text-base focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              required
              autoFocus
              disabled={isLoading}
            >
              <option value="">{t('selectSession')}</option>
              {notes.map((note) => (
                <option key={note.id} value={note.id}>
                  {note.title}
                </option>
              ))}
            </select>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 disabled:bg-secondary/50 disabled:cursor-not-allowed rounded-lg transition-colors text-secondary-foreground text-sm font-medium"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-secondary disabled:cursor-not-allowed disabled:text-muted-foreground rounded-lg transition-colors text-primary-foreground text-sm font-medium flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? t('processing') : t('add')}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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

// 文档预览面板组件
interface DocumentViewerPanelProps {
  document: KnowledgeDocument
  onBack: () => void
}

function DocumentViewerPanel({ document, onBack }: DocumentViewerPanelProps) {
  const { t } = useTranslation('ui')
  const [content, setContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  // 加载文档内容
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true)
      try {
        const chunks = await window.api.knowledge.getDocumentChunks(document.id)
        // 合并所有 chunk 的内容
        const fullContent = chunks.map((chunk) => chunk.content).join('\n\n')
        setContent(fullContent)
      } catch (error) {
        console.error('Error loading document content:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadContent()
  }, [document.id])

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
            className="p-1.5 hover:bg-muted rounded-lg transition-colors shrink-0"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            title={t('backToList')}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="flex-1 min-w-0 text-sm font-medium truncate">{document.title}</span>
        </div>
      </div>

      {/* 文档内容 */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="p-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{content}</pre>
            </div>
          </div>
        )}
      </ScrollArea>
    </>
  )
}

export default function SourcePanel(): ReactElement {
  const { t } = useTranslation('ui')
  const { id: notebookId } = useParams()
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [modalType, setModalType] = useState<AddSourceType | null>(null)
  const [defaultEmbeddingModel, setDefaultEmbeddingModel] = useState<string | undefined>(undefined)
  const [selectedDocument, setSelectedDocument] = useState<KnowledgeDocument | null>(null)

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

  // 加载默认嵌入模型设置
  useEffect(() => {
    const loadEmbeddingModel = async () => {
      const model = await window.api.settings.get('defaultEmbeddingModel')
      setDefaultEmbeddingModel(model)
    }
    loadEmbeddingModel()

    // 监听设置变化
    const unsubscribe = window.api.settings.onSettingsChange((newSettings) => {
      setDefaultEmbeddingModel(newSettings.defaultEmbeddingModel)
    })

    return unsubscribe
  }, [])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebookId])

  // 当 notebook 切换时清空选中的文档
  useEffect(() => {
    setSelectedDocument(null)
  }, [notebookId])

  // 处理文件上传
  const handleFileUpload = useCallback(async () => {
    if (!notebookId) return

    // 检查是否配置了默认嵌入模型
    if (!defaultEmbeddingModel) {
      alert(t('noEmbeddingModelConfigured'))
      return
    }

    const files = await selectFiles()
    for (const filePath of files) {
      await addDocumentFromFile(notebookId, filePath)
    }
    setShowAddMenu(false)
  }, [notebookId, defaultEmbeddingModel, selectFiles, addDocumentFromFile, t])

  // 处理 URL 导入
  const handleUrlImport = useCallback(
    async (data: { url?: string }) => {
      if (!notebookId || !data.url) return

      // 检查是否配置了默认嵌入模型
      if (!defaultEmbeddingModel) {
        alert(t('noEmbeddingModelConfigured'))
        setModalType(null)
        return
      }

      await addDocumentFromUrl(notebookId, data.url)
      setModalType(null)
    },
    [notebookId, defaultEmbeddingModel, addDocumentFromUrl, t]
  )

  // 处理文本粘贴
  const handleTextPaste = useCallback(
    async (data: { title?: string; content?: string }) => {
      if (!notebookId || !data.title || !data.content) return

      // 检查是否配置了默认嵌入模型
      if (!defaultEmbeddingModel) {
        alert(t('noEmbeddingModelConfigured'))
        setModalType(null)
        return
      }

      await addDocument(notebookId, {
        title: data.title,
        type: 'text',
        content: data.content
      })
      setModalType(null)
    },
    [notebookId, defaultEmbeddingModel, addDocument, t]
  )

  // 处理笔记导入
  const handleNoteImport = useCallback(
    async (data: { noteId?: string }) => {
      if (!notebookId || !data.noteId) return

      // 检查是否配置了默认嵌入模型
      if (!defaultEmbeddingModel) {
        alert(t('noEmbeddingModelConfigured'))
        setModalType(null)
        return
      }

      await addNoteToKnowledge(notebookId, data.noteId)
      setModalType(null)
    },
    [notebookId, defaultEmbeddingModel, addNoteToKnowledge, t]
  )

  // 处理删除文档
  const handleDelete = useCallback(
    async (documentId: string) => {
      if (!notebookId) return
      await deleteDocument(notebookId, documentId)
    },
    [notebookId, deleteDocument]
  )

  // 处理打开源文件
  const handleOpenSource = useCallback(async (documentId: string) => {
    try {
      await window.api.knowledge.openSource(documentId)
    } catch (error) {
      console.error('Error opening source:', error)
    }
  }, [])

  // 处理文档点击
  const handleSelectDocument = useCallback(
    (document: KnowledgeDocument) => {
      // 文本和笔记类型可以预览，直接显示预览页面
      if (document.type === 'text' || document.type === 'note') {
        setSelectedDocument(document)
      } else {
        // 其他类型（文件、URL）直接打开
        handleOpenSource(document.id)
      }
    },
    [handleOpenSource]
  )

  // 返回列表
  const handleBack = useCallback(() => {
    setSelectedDocument(null)
  }, [])

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
    <div className="flex flex-col bg-card rounded-xl overflow-hidden h-full shadow-md">
      {selectedDocument ? (
        // 文档预览页面
        <DocumentViewerPanel
          key={selectedDocument.id}
          document={selectedDocument}
          onBack={handleBack}
        />
      ) : (
        // 文档列表页面
        <>
          {/* 顶部工具栏 */}
          <div
            className="h-14 flex items-center justify-between px-4 border-b border-border/50"
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
          >
            <span className="text-sm text-foreground">{t('knowledgeBase')}</span>
            <div className="relative" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                disabled={!defaultEmbeddingModel}
                className={`p-1.5 rounded-lg transition-colors ${
                  !defaultEmbeddingModel ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'
                }`}
                title={!defaultEmbeddingModel ? t('noEmbeddingModelConfigured') : t('addSource')}
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
              <DocumentList
                documents={documents}
                onDeleteDocument={handleDelete}
                onSelectDocument={handleSelectDocument}
              />
            </ScrollArea>
          )}
        </>
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
