import { useEffect, useCallback, ReactNode, ReactElement } from 'react'
import * as React from 'react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../ui/resizable'
import { usePanelRef } from 'react-resizable-panels'

export interface ResizableLayoutProps {
  leftPanel: ReactNode
  centerPanel: ReactNode
  rightPanel: ReactNode
  defaultLeftWidth?: number
  defaultRightWidth?: number
  minLeftWidth?: number
  minRightWidth?: number
  minCenterWidth?: number
}

// 黄金比例常量
const GOLDEN_RATIO = 1.618

// 计算黄金比例的默认大小（百分比）
// - 左面板占比 = 1 / (2 + φ) ≈ 0.276 (27.6%)
// - 中面板占比 = φ / (2 + φ) ≈ 0.447 (44.7%)
// - 右面板占比 = 1 / (2 + φ) ≈ 0.276 (27.6%)
const totalRatio = 2 + GOLDEN_RATIO
const sideRatio = 1 / totalRatio
const centerRatio = GOLDEN_RATIO / totalRatio

const defaultLeftSize = sideRatio * 100 // ≈ 27.6
const defaultCenterSize = centerRatio * 100 // ≈ 44.7
const defaultRightSize = sideRatio * 100 // ≈ 27.6

export default function ResizableLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  minLeftWidth = 200,
  minRightWidth = 200,
  minCenterWidth = 300
}: ResizableLayoutProps): ReactElement {
  const leftPanelRef = usePanelRef()
  const rightPanelRef = usePanelRef()

  const [isLeftCollapsed, setIsLeftCollapsed] = React.useState(false)
  const [isRightCollapsed, setIsRightCollapsed] = React.useState(false)

  // 折叠/展开左侧面板
  const toggleLeftPanel = useCallback(() => {
    const panel = leftPanelRef.current
    if (panel) {
      if (panel.isCollapsed()) {
        panel.expand()
      } else {
        panel.collapse()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 折叠/展开右侧面板
  const toggleRightPanel = useCallback(() => {
    const panel = rightPanelRef.current
    if (panel) {
      if (panel.isCollapsed()) {
        panel.expand()
      } else {
        panel.collapse()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 监听面板切换快捷键
  useEffect(() => {
    const handleToggleKnowledgeBase = () => {
      toggleLeftPanel()
    }

    const handleToggleCreativeSpace = () => {
      toggleRightPanel()
    }

    window.addEventListener('shortcut:toggle-knowledge-base', handleToggleKnowledgeBase)
    window.addEventListener('shortcut:toggle-creative-space', handleToggleCreativeSpace)

    return () => {
      window.removeEventListener('shortcut:toggle-knowledge-base', handleToggleKnowledgeBase)
      window.removeEventListener('shortcut:toggle-creative-space', handleToggleCreativeSpace)
    }
  }, [toggleLeftPanel, toggleRightPanel])

  return (
    <div className="flex flex-1 overflow-hidden p-2">
      <ResizablePanelGroup orientation="horizontal" className="h-full gap-1">
        {/* 左侧面板 */}
        <ResizablePanel
          panelRef={leftPanelRef}
          defaultSize={defaultLeftSize}
          minSize={minLeftWidth}
          collapsible
          collapsedSize={0}
          onResize={(size) => setIsLeftCollapsed(Number(size) === 0)}
        >
          {leftPanel}
        </ResizablePanel>

        {/* 左侧拖拽条 */}
        <ResizableHandle />

        {/* 中间面板 */}
        <ResizablePanel defaultSize={defaultCenterSize} minSize={minCenterWidth}>
          {}
          {React.cloneElement(
            centerPanel as ReactElement,
            {
              onToggleLeft: toggleLeftPanel,
              onToggleRight: toggleRightPanel,
              isLeftCollapsed,
              isRightCollapsed
            } as any
          )}
        </ResizablePanel>

        {/* 右侧拖拽条 */}
        <ResizableHandle />

        {/* 右侧面板 */}
        <ResizablePanel
          panelRef={rightPanelRef}
          defaultSize={defaultRightSize}
          minSize={minRightWidth}
          collapsible
          collapsedSize={0}
          onResize={(size) => setIsRightCollapsed(Number(size) === 0)}
        >
          {rightPanel}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
