import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { useTranslation } from 'react-i18next'
import { useMindMapStore } from '../../store/mindmapStore'
import MindMapCanvas from '../notebook/mindmap/MindMapCanvas'
import NodeDetailPanel from '../notebook/mindmap/NodeDetailPanel'

export default function MindMapPage() {
  const { notebookId, mindMapId } = useParams<{ notebookId?: string; mindMapId?: string }>()
  const { t } = useTranslation('notebook')
  const {
    currentMindMap,
    isGenerating,
    generationProgress,
    generateMindMap,
    loadLatestMindMap,
    loadMindMap
  } = useMindMapStore()

  const [isLoading, setIsLoading] = useState(true)

  // 加载思维导图
  useEffect(() => {
    setIsLoading(true)

    if (mindMapId) {
      // 查看特定版本
      loadMindMap(mindMapId)
        .catch((error) => {
          console.error('[MindMapPage] Failed to load mind map:', error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else if (notebookId) {
      // 加载最新版本（用于生成）
      loadLatestMindMap(notebookId)
        .catch((error) => {
          console.error('[MindMapPage] Failed to load mind map:', error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [notebookId, mindMapId, loadLatestMindMap, loadMindMap])

  const handleGenerate = async () => {
    if (notebookId) {
      try {
        await generateMindMap(notebookId)
      } catch (error) {
        console.error('[MindMapPage] Failed to generate mind map:', error)
      }
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* 顶部占位空间 */}
      <div
        style={{
          height: '35px',
          flexShrink: 0,
          WebkitAppRegion: 'drag'
        }}
      />

      {/* 思维导图头部 */}
      <div
        className="px-6 py-4 border-b border-border flex-shrink-0"
        style={{
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          WebkitAppRegion: 'drag'
        }}
      >
        <h1 className="text-lg font-semibold text-foreground">{t('mindMap')}</h1>
        <div
          className="flex items-center gap-2"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {!currentMindMap && !isGenerating && !isLoading && (
            <Button onClick={handleGenerate} size="sm">
              {t('generateMindMap')}
            </Button>
          )}
          {currentMindMap && !isGenerating && (
            <Button onClick={handleGenerate} size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('regenerate')}
            </Button>
          )}
          {isGenerating && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('generating')} ({generationProgress?.progress || 0}%)
            </div>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
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
            <div style={{ flex: 1, position: 'relative' }}>
              <MindMapCanvas mindMap={currentMindMap} />
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
