import * as React from 'react'
import { useEffect, useRef, useState, ReactNode, ReactElement } from 'react'
import DragHandle from './DragHandle'

export interface ResizableLayoutProps {
  leftPanel: ReactNode
  centerPanel: ReactNode
  rightPanel: ReactNode
  defaultLeftWidth?: number
  defaultRightWidth?: number
}

// 黄金比例常量
const GOLDEN_RATIO = 1.618
const MIN_SIDE_WIDTH = 260
const MIN_CENTER_WIDTH = 420
const DRAG_HANDLE_WIDTH = 12 // w-3
const CONTAINER_PADDING_X = 16 // p-2 左右总和

const calculateGoldenRatioWidths = (containerWidth: number) => {
  const availableWidth = containerWidth - CONTAINER_PADDING_X - DRAG_HANDLE_WIDTH * 2
  const totalRatio = 2 + GOLDEN_RATIO
  const sideRatio = 1 / totalRatio
  const leftWidth = Math.floor(availableWidth * sideRatio)
  const rightWidth = Math.floor(availableWidth * sideRatio)
  return { leftWidth, rightWidth }
}

export default function ResizableLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  defaultLeftWidth,
  defaultRightWidth
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

  useEffect(() => {
    const updateWidths = () => {
      if (!containerRef.current || isInitialized) return
      const containerWidth = containerRef.current.getBoundingClientRect().width
      const { leftWidth: goldenLeftWidth, rightWidth: goldenRightWidth } =
        calculateGoldenRatioWidths(containerWidth)
      setLeftWidth(defaultLeftWidth || goldenLeftWidth)
      setRightWidth(defaultRightWidth || goldenRightWidth)
      setIsInitialized(true)
    }

    updateWidths()
    const handleResize = () => {
      if (!isInitialized) {
        updateWidths()
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [defaultLeftWidth, defaultRightWidth, isInitialized])

  const handleMouseDown = (side: 'left' | 'right') => {
    if (side === 'left') {
      setIsDraggingLeft(true)
    } else {
      setIsDraggingRight(true)
    }
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const containerWidth = containerRect.width - CONTAINER_PADDING_X
    const leftVisible = !isLeftCollapsed
    const rightVisible = !isRightCollapsed
    const handlesWidth = (leftVisible ? 1 : 0) * DRAG_HANDLE_WIDTH + (rightVisible ? 1 : 0) * DRAG_HANDLE_WIDTH
    const effectiveLeftWidth = leftVisible ? leftWidth : 0
    const effectiveRightWidth = rightVisible ? rightWidth : 0

    if (isDraggingLeft && leftVisible) {
      const mouseX = event.clientX - containerRect.left - CONTAINER_PADDING_X / 2
      const maxLeftWidth = containerWidth - effectiveRightWidth - MIN_CENTER_WIDTH - handlesWidth
      const newWidth = Math.max(MIN_SIDE_WIDTH, Math.min(maxLeftWidth, mouseX))
      setLeftWidth(newWidth)
    }

    if (isDraggingRight && rightVisible) {
      const mouseX = containerRect.right - event.clientX - CONTAINER_PADDING_X / 2
      const maxRightWidth = containerWidth - effectiveLeftWidth - MIN_CENTER_WIDTH - handlesWidth
      const newWidth = Math.max(MIN_SIDE_WIDTH, Math.min(maxRightWidth, mouseX))
      setRightWidth(newWidth)
    }
  }

  const handleMouseUp = () => {
    setIsDraggingLeft(false)
    setIsDraggingRight(false)
  }

  const toggleLeftPanel = () => {
    if (isLeftCollapsed) {
      setLeftWidth(savedLeftWidth || defaultLeftWidth || leftWidth)
      setSavedLeftWidth(null)
    } else {
      setSavedLeftWidth(leftWidth)
    }
    setIsLeftCollapsed(!isLeftCollapsed)
  }

  const toggleRightPanel = () => {
    if (isRightCollapsed) {
      setRightWidth(savedRightWidth || defaultRightWidth || rightWidth)
      setSavedRightWidth(null)
    } else {
      setSavedRightWidth(rightWidth)
    }
    setIsRightCollapsed(!isRightCollapsed)
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-1 overflow-hidden p-2"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {!isLeftCollapsed && (
        <div
          className="h-full overflow-hidden"
          style={{ width: `${leftWidth}px`, minWidth: `${MIN_SIDE_WIDTH}px` }}
        >
          {leftPanel}
        </div>
      )}

      {!isLeftCollapsed && <DragHandle onMouseDown={() => handleMouseDown('left')} />}

      <div
        className="flex-1 h-full overflow-hidden"
        style={MIN_CENTER_WIDTH > 0 ? { minWidth: `${MIN_CENTER_WIDTH}px` } : undefined}
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

      {!isRightCollapsed && <DragHandle onMouseDown={() => handleMouseDown('right')} />}

      {!isRightCollapsed && (
        <div
          className="h-full overflow-hidden"
          style={{ width: `${rightWidth}px`, minWidth: `${MIN_SIDE_WIDTH}px` }}
        >
          {rightPanel}
        </div>
      )}
    </div>
  )
}
