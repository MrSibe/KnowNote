import { ReactElement, useRef, useEffect } from 'react'
import { FileText, Globe, FileUp, StickyNote, Trash2, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { KnowledgeDocument } from '../../../../../shared/types/knowledge'

interface DocumentListProps {
  documents: KnowledgeDocument[]
  onDeleteDocument: (documentId: string) => void
}

export default function DocumentList({
  documents,
  onDeleteDocument
}: DocumentListProps): ReactElement {
  const { t } = useTranslation('ui')

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <FileText className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">{t('noDocuments')}</p>
        <p className="text-xs text-muted-foreground mt-2">{t('noDocumentsDesc')}</p>
      </div>
    )
  }

  return (
    <div className="p-2 space-y-1">
      {documents.map((doc) => (
        <DocumentItem key={doc.id} document={doc} onDelete={onDeleteDocument} />
      ))}
    </div>
  )
}

// 文档项组件
interface DocumentItemProps {
  document: KnowledgeDocument
  onDelete: (id: string) => void
}

function DocumentItem({ document, onDelete }: DocumentItemProps): ReactElement {
  const { t } = useTranslation('ui')
  const hasShownErrorRef = useRef(false)

  const getTypeIcon = () => {
    const iconClass = 'w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground'
    switch (document.type) {
      case 'file':
        return <FileUp className={iconClass} />
      case 'url':
        return <Globe className={iconClass} />
      case 'note':
        return <StickyNote className={iconClass} />
      default:
        return <FileText className={iconClass} />
    }
  }

  // 显示失败提示（仅一次）
  useEffect(() => {
    if (document.status === 'failed' && !hasShownErrorRef.current) {
      hasShownErrorRef.current = true
      alert(t('embeddingFailed', { title: document.title }))
    }
  }, [document.status, document.title, t])

  return (
    <div
      className={`group relative p-3 pr-12 rounded-lg transition-colors ${
        document.status === 'processing' ? 'bg-muted/50' : 'hover:bg-muted'
      }`}
    >
      <div className="flex items-start gap-2 min-w-0">
        {getTypeIcon()}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium truncate">{document.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{document.chunkCount} chunks</p>
          {document.status === 'processing' && (
            <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              {t('indexing')}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (confirm(t('confirmDeleteDocument'))) {
            onDelete(document.id)
          }
        }}
        className="absolute right-3 top-2.5 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-all"
        title={t('deleteDocument')}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
