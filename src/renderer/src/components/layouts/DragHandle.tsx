export interface DragHandleProps {
  onMouseDown: () => void
}

export default function DragHandle({ onMouseDown }: DragHandleProps) {
  return (
    <div
      className="w-3 flex-shrink-0 cursor-col-resize hover:bg-gray-700/30 transition-colors"
      onMouseDown={onMouseDown}
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    />
  )
}
