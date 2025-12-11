export interface NotePanelProps {
  title?: string
}

export default function NotePanel({ title = 'Note' }: NotePanelProps) {
  return (
    <div className="flex flex-col bg-[#171717] rounded-xl overflow-hidden h-full">
      {/* 顶部拖拽区域 */}
      <div
        className="h-14 flex items-center justify-center border-b border-gray-800/50"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <span className="text-sm text-gray-300">{title}</span>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          <div className="p-4 bg-[#2a2a2a] rounded-lg">
            <p className="text-sm text-gray-400">笔记内容</p>
          </div>
        </div>
      </div>
    </div>
  )
}
