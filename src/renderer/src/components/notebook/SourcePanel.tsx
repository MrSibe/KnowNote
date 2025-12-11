import { MoreHorizontal } from 'lucide-react'

export interface SourcePanelProps {
  onNewChatClick?: () => void
}

export default function SourcePanel({ onNewChatClick }: SourcePanelProps) {
  return (
    <div className="flex flex-col bg-[#171717] rounded-xl overflow-hidden h-full">
      {/* 顶部按钮区域 */}
      <div
        className="px-4 py-4 space-y-2"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={onNewChatClick}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#2a2a2a] hover:bg-[#333333] rounded-lg transition-colors"
        >
          <span className="text-sm font-medium">New Chat</span>
        </button>
      </div>

      {/* 来源列表 */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="space-y-1">
          <div className="px-4 py-3 hover:bg-[#2a2a2a] rounded-lg cursor-pointer transition-colors">
            <p className="text-sm text-gray-300 truncate">AI Assistant Capabilities ...</p>
          </div>
        </div>
      </div>

      {/* 底部菜单 */}
      <div className="p-4 border-t border-gray-800/50">
        <button className="w-full flex items-center justify-center p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  )
}
