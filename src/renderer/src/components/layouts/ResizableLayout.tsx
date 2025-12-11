import { useState, useRef, ReactNode } from 'react'
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

export default function ResizableLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  defaultLeftWidth = 320,
  defaultRightWidth = 360,
  minLeftWidth = 200,
  minRightWidth = 200,
  minCenterWidth = 200
}: ResizableLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth)
  const [rightWidth, setRightWidth] = useState(defaultRightWidth)
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)
  const [isDraggingRight, setIsDraggingRight] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (side: 'left' | 'right') => {
    if (side === 'left') {
      setIsDraggingLeft(true)
    } else {
      setIsDraggingRight(true)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
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

  const handleMouseUp = () => {
    setIsDraggingLeft(false)
    setIsDraggingRight(false)
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-1 px-3 pb-3 gap-0"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 左侧面板 */}
      <div style={{ width: `${leftWidth}px`, minWidth: `${minLeftWidth}px` }}>{leftPanel}</div>

      {/* 左侧拖拽条 */}
      <DragHandle onMouseDown={() => handleMouseDown('left')} />

      {/* 中间面板 */}
      <div
        className="flex-1"
        style={minCenterWidth > 0 ? { minWidth: `${minCenterWidth}px` } : undefined}
      >
        {centerPanel}
      </div>

      {/* 右侧拖拽条 */}
      <DragHandle onMouseDown={() => handleMouseDown('right')} />

      {/* 右侧面板 */}
      <div style={{ width: `${rightWidth}px`, minWidth: `${minRightWidth}px` }}>{rightPanel}</div>
    </div>
  )
}
