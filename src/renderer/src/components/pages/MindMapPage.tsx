import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2, ArrowUpDown, ArrowRightLeft, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toPng } from 'html-to-image'
import { useMindMapStore } from '../../store/mindmapStore'
import MindMapCanvas from '../notebook/mindmap/MindMapCanvas'
import NodeDetailPanel from '../notebook/mindmap/NodeDetailPanel'

export default function MindMapPage() {
  const { notebookId, mindMapId } = useParams<{ notebookId?: string; mindMapId?: string }>()
  const { t } = useTranslation('notebook')
  const { currentMindMap, isGenerating, loadLatestMindMap, loadMindMap } = useMindMapStore()

  const [isLoading, setIsLoading] = useState(true)
  const [direction, setDirection] = useState<'TB' | 'LR'>('LR')
  const mindMapContainerRef = useRef<HTMLDivElement>(null)

  // 加载思维导图
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        if (mindMapId) {
          await loadMindMap(mindMapId)
        } else if (notebookId) {
          await loadLatestMindMap(notebookId)
        }
      } catch (error) {
        console.error('[MindMapPage] Failed to load mind map:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [notebookId, mindMapId, loadLatestMindMap, loadMindMap])

  // 切换布局方向
  const toggleDirection = () => {
    setDirection((prev) => (prev === 'LR' ? 'TB' : 'LR'))
  }

  // 导出思维导图为图片
  const handleExport = async () => {
    if (!mindMapContainerRef.current) return

    try {
      const dataUrl = await toPng(mindMapContainerRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        quality: 1
      })

      // 创建下载链接
      const link = document.createElement('a')
      link.download = `mindmap-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('[MindMapPage] Failed to export image:', error)
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* 顶部可拖拽标题栏 */}
      <div
        className="absolute top-0 left-0 right-0 h-10 z-10 flex items-center justify-between px-4 bg-background"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div style={{ width: '100px' }}></div>
        <span className="text-sm text-muted-foreground font-medium">{t('mindMap')}</span>
        <div
          className="flex items-center gap-2"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {currentMindMap && (
            <>
              <button
                onClick={toggleDirection}
                className="p-1.5 rounded hover:bg-accent transition-colors"
                title={direction === 'LR' ? '切换为垂直布局' : '切换为横向布局'}
              >
                {direction === 'LR' ? (
                  <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              <button
                onClick={handleExport}
                className="p-1.5 rounded hover:bg-accent transition-colors"
                title="导出为图片"
              >
                <Download className="w-4 h-4 text-muted-foreground" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
          paddingTop: '40px'
        }}
      >
        {isLoading ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="text-muted-foreground"
          >
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : currentMindMap ? (
          <>
            <div ref={mindMapContainerRef} style={{ flex: 1, position: 'relative' }}>
              <MindMapCanvas mindMap={currentMindMap} direction={direction} />
            </div>
            <NodeDetailPanel />
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="text-muted-foreground"
          >
            {isGenerating ? t('generatingMindMap') : t('noMindMapYet')}
          </div>
        )}
      </div>
    </div>
  )
}
