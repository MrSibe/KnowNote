import { useEffect, useCallback, ReactNode, ReactElement, useRef } from 'react'
import * as React from 'react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../ui/resizable'
import { usePanelRef } from 'react-resizable-panels'

export interface ResizableLayoutProps {
  leftPanel: ReactNode
  centerPanel: ReactNode
  rightPanel: ReactNode
  defaultLeftWidth?: number
  defaultRightWidth?: number
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

// 左右面板最小宽度（像素）
const MIN_SIDE_WIDTH = 260

export default function ResizableLayout({
  leftPanel,
  centerPanel,
  rightPanel
}: ResizableLayoutProps): ReactElement {
  const leftPanelRef = usePanelRef()
  const rightPanelRef = usePanelRef()
  const lastLeftSizeRef = useRef(defaultLeftSize)
  const lastRightSizeRef = useRef(defaultRightSize)

  const [isLeftCollapsed, setIsLeftCollapsed] = React.useState(false)
  const [isRightCollapsed, setIsRightCollapsed] = React.useState(false)
  // 折叠/展开左侧面板
  const toggleLeftPanel = useCallback(() => {
    const panel = leftPanelRef.current
    if (panel) {
      if (isLeftCollapsed) {
        setIsLeftCollapsed(false)
        const nextSize = Math.max(lastLeftSizeRef.current || defaultLeftSize, 1)
        requestAnimationFrame(() => {
          panel.resize(nextSize)
        })
      } else {
        const currentSize = panel.getSize()?.asPercentage ?? defaultLeftSize
        lastLeftSizeRef.current = Math.max(currentSize, 1)
        setIsLeftCollapsed(true)
        requestAnimationFrame(() => {
          panel.resize(0)
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLeftCollapsed])

  // 折叠/展开右侧面板
  const toggleRightPanel = useCallback(() => {
    const panel = rightPanelRef.current
    if (panel) {
      if (isRightCollapsed) {
        setIsRightCollapsed(false)
        const nextSize = Math.max(lastRightSizeRef.current || defaultRightSize, 1)
        requestAnimationFrame(() => {
          panel.resize(nextSize)
        })
      } else {
        const currentSize = panel.getSize()?.asPercentage ?? defaultRightSize
        lastRightSizeRef.current = Math.max(currentSize, 1)
        setIsRightCollapsed(true)
        requestAnimationFrame(() => {
          panel.resize(0)
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRightCollapsed])

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
          minSize={isLeftCollapsed ? 0 : MIN_SIDE_WIDTH}
        >
          {leftPanel}
        </ResizablePanel>

        {/* 左侧拖拽条 */}
        <ResizableHandle />

        {/* 中间面板 */}
        <ResizablePanel defaultSize={defaultCenterSize} minSize={420}>
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
          minSize={isRightCollapsed ? 0 : MIN_SIDE_WIDTH}
        >
          {rightPanel}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
