import { useState, useRef, useEffect, ReactNode, ReactElement } from 'react'
import * as React from 'react'
import DragHandle from './DragHandle'

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

// 根据容器宽度计算黄金比例的默认宽度
const calculateGoldenRatioWidths = (
  containerWidth: number
): { leftWidth: number; rightWidth: number } => {
  const paddingHorizontal = 24 // px-3 的左右 padding
  const dragHandleWidth = 12 // 每个拖拽条的宽度
  const availableWidth = containerWidth - paddingHorizontal - dragHandleWidth * 2

  // 使用黄金比例分配：
  // - 左面板 : 中面板 = 1 : φ
  // - 右面板 : 中面板 = 1 : φ
  // 总宽度 = 左 + 中 + 右 = x + φx + x = (2 + φ)x
  // 因此：
  // - 左面板占比 = 1 / (2 + φ) ≈ 0.276 (27.6%)
  // - 中面板占比 = φ / (2 + φ) ≈ 0.447 (44.7%)
  // - 右面板占比 = 1 / (2 + φ) ≈ 0.276 (27.6%)
  const totalRatio = 2 + GOLDEN_RATIO // ≈ 3.618
  const sideRatio = 1 / totalRatio // ≈ 0.276

  const leftWidth = Math.floor(availableWidth * sideRatio)
  const rightWidth = Math.floor(availableWidth * sideRatio)

  return { leftWidth, rightWidth }
}

export default function ResizableLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  defaultLeftWidth,
  defaultRightWidth,
  minLeftWidth = 200,
  minRightWidth = 200,
  minCenterWidth = 300
}: ResizableLayoutProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth || 320)
  const [rightWidth, setRightWidth] = useState(defaultRightWidth || 360)
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)
  const [isDraggingRight, setIsDraggingRight] = useState(false)
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false)
  const [isRightCollapsed, setIsRightCollapsed] = useState(false)
  const [savedLeftWidth, setSavedLeftWidth] = useState<number | null>(null)
  const [savedRightWidth, setSavedRightWidth] = useState<number | null>(null)

  // 初始化和窗口大小变化时计算黄金比例宽度
  useEffect(() => {
    const updateWidths = (): void => {
      if (containerRef.current && !isInitialized) {
        const containerWidth = containerRef.current.getBoundingClientRect().width
        const { leftWidth: goldenLeftWidth, rightWidth: goldenRightWidth } =
          calculateGoldenRatioWidths(containerWidth)

        // 如果用户没有提供默认宽度，使用黄金比例计算的值
        setLeftWidth(defaultLeftWidth || goldenLeftWidth)
        setRightWidth(defaultRightWidth || goldenRightWidth)
        setIsInitialized(true)
      }
    }

    // 初始化时计算
    updateWidths()

    // 监听窗口大小变化（可选：如果希望窗口调整时重新计算默认值）
    const handleResize = (): void => {
      if (!isInitialized) {
        updateWidths()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [defaultLeftWidth, defaultRightWidth, isInitialized])

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
  }, [isLeftCollapsed, isRightCollapsed, leftWidth, rightWidth, savedLeftWidth, savedRightWidth])

  const handleMouseDown = (side: 'left' | 'right'): void => {
    if (side === 'left') {
      setIsDraggingLeft(true)
    } else {
      setIsDraggingRight(true)
    }
  }

  const handleMouseMove = (e: React.MouseEvent): void => {
    if (!containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const paddingHorizontal = 24 // px-3 的左右 padding (12px * 2)
    const containerWidth = containerRect.width - paddingHorizontal // 实际可用宽度
    const dragHandleWidth = 12 // 每个拖拽条的宽度

    if (isDraggingLeft) {
      // 计算鼠标相对于容器左边缘的距离（考虑 padding）
      const mouseX = e.clientX - containerRect.left - 12 // 减去左侧 padding

      // 计算左侧面板的最大宽度：容器可用宽度 - 右侧面板当前宽度 - 中间面板最小宽度 - 两个拖拽条宽度
      const maxLeftWidth = containerWidth - rightWidth - minCenterWidth - dragHandleWidth * 2

      // 限制左侧面板在最小和最大宽度之间
      const newWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, mouseX))
      setLeftWidth(newWidth)
    }
    if (isDraggingRight) {
      // 计算鼠标相对于容器右边缘的距离（考虑 padding）
      const mouseX = containerRect.right - e.clientX - 12 // 减去右侧 padding

      // 计算右侧面板的最大宽度：容器可用宽度 - 左侧面板当前宽度 - 中间面板最小宽度 - 两个拖拽条宽度
      const maxRightWidth = containerWidth - leftWidth - minCenterWidth - dragHandleWidth * 2

      // 限制右侧面板在最小和最大宽度之间
      const newWidth = Math.max(minRightWidth, Math.min(maxRightWidth, mouseX))
      setRightWidth(newWidth)
    }
  }

  const handleMouseUp = (): void => {
    setIsDraggingLeft(false)
    setIsDraggingRight(false)
  }

  // 折叠/展开左侧面板
  const toggleLeftPanel = (): void => {
    if (isLeftCollapsed) {
      // 展开：恢复之前的宽度
      setLeftWidth(savedLeftWidth || defaultLeftWidth || 320)
      setSavedLeftWidth(null)
    } else {
      // 折叠：保存当前宽度
      setSavedLeftWidth(leftWidth)
    }
    setIsLeftCollapsed(!isLeftCollapsed)
  }

  // 折叠/展开右侧面板
  const toggleRightPanel = (): void => {
    if (isRightCollapsed) {
      setRightWidth(savedRightWidth || defaultRightWidth || 360)
      setSavedRightWidth(null)
    } else {
      setSavedRightWidth(rightWidth)
    }
    setIsRightCollapsed(!isRightCollapsed)
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-1 px-3 pb-3 gap-0 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 左侧面板 - 条件渲染 */}
      {!isLeftCollapsed && (
        <div
          className="h-full overflow-hidden"
          style={{ width: `${leftWidth}px`, minWidth: `${minLeftWidth}px` }}
        >
          {leftPanel}
        </div>
      )}

      {/* 左侧拖拽条 - 条件渲染 */}
      {!isLeftCollapsed && <DragHandle onMouseDown={() => handleMouseDown('left')} />}

      {/* 中间面板 - 使用 React.cloneElement 注入 props */}
      <div
        className="flex-1 h-full overflow-hidden"
        style={minCenterWidth > 0 ? { minWidth: `${minCenterWidth}px` } : undefined}
      >
        {React.cloneElement(
          centerPanel as ReactElement,
          {
            onToggleLeft: toggleLeftPanel,
            onToggleRight: toggleRightPanel,
            isLeftCollapsed,
            isRightCollapsed
          } as any
        )}
      </div>

      {/* 右侧拖拽条 - 条件渲染 */}
      {!isRightCollapsed && <DragHandle onMouseDown={() => handleMouseDown('right')} />}

      {/* 右侧面板 - 条件渲染 */}
      {!isRightCollapsed && (
        <div
          className="h-full overflow-hidden"
          style={{ width: `${rightWidth}px`, minWidth: `${minRightWidth}px` }}
        >
          {rightPanel}
        </div>
      )}
    </div>
  )
}
