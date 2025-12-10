import { useState } from 'react'
import { MoreHorizontal, Paperclip, Send } from 'lucide-react'

export default function ChatLayout() {
  const [messages] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [leftWidth, setLeftWidth] = useState(320)
  const [rightWidth, setRightWidth] = useState(360)
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)
  const [isDraggingRight, setIsDraggingRight] = useState(false)

  const handleMouseDown = (side: 'left' | 'right') => {
    if (side === 'left') {
      setIsDraggingLeft(true)
    } else {
      setIsDraggingRight(true)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingLeft) {
      const newWidth = Math.max(200, Math.min(500, e.clientX - 12))
      setLeftWidth(newWidth)
    }
    if (isDraggingRight) {
      const newWidth = Math.max(200, Math.min(500, window.innerWidth - e.clientX - 12))
      setRightWidth(newWidth)
    }
  }

  const handleMouseUp = () => {
    setIsDraggingLeft(false)
    setIsDraggingRight(false)
  }

  return (
    <div
      className="flex flex-col h-screen bg-[#212121] text-gray-100"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 全局顶部拖拽区域 */}
      <div
        className="h-10 flex-shrink-0"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      ></div>

      {/* 三栏布局 */}
      <div className="flex flex-1 px-3 pb-3 gap-0">
        {/* 左侧边栏 - 来源 */}
        <div
          className="flex flex-col bg-[#171717] rounded-xl overflow-hidden"
          style={{ width: `${leftWidth}px` }}
        >
          {/* 顶部按钮区域 */}
          <div
            className="px-4 py-4 space-y-2"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            <button className="w-full flex items-center justify-between px-4 py-3 bg-[#2a2a2a] hover:bg-[#333333] rounded-lg transition-colors">
              <span className="text-sm font-medium">New Chat</span>
            </button>
          </div>

          {/* 聊天历史 */}
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

        {/* 左侧拖拽条 */}
        <div
          className="w-3 flex-shrink-0 cursor-col-resize hover:bg-gray-700/30 transition-colors"
          onMouseDown={() => handleMouseDown('left')}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        ></div>

        {/* 中间主区域 - 对话 */}
        <div className="flex-1 flex flex-col bg-[#171717] rounded-xl overflow-hidden mx-0">
          {/* 顶部标题栏 */}
          <div
            className="h-14 flex items-center justify-center border-b border-gray-800/50"
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
          >
            <span
              className="text-sm text-gray-400"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
              0 条消息
            </span>
          </div>

          {/* 聊天消息区域 */}
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500"></p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className="p-4 bg-[#2a2a2a] rounded-lg">
                    {msg}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 底部输入区域 */}
          <div className="border-t border-gray-800/50 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="relative flex items-center bg-[#2a2a2a] rounded-lg border border-gray-700 focus-within:border-gray-600">
                {/* 附件按钮 */}
                <button className="p-3 text-gray-400 hover:text-gray-300 transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>

                {/* 输入框 */}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="输入消息..."
                  className="flex-1 bg-transparent px-2 py-3 text-sm outline-none text-gray-100 placeholder-gray-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      // 发送消息逻辑
                    }
                  }}
                />

                {/* 右侧按钮组 */}
                <div className="flex items-center gap-2 pr-2">
                  {/* 模型选择器 */}
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-[#3a3a3a] hover:bg-[#444444] rounded-md transition-colors text-xs">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-300">deepseek-reasoner</span>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* 发送按钮 */}
                  <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧拖拽条 */}
        <div
          className="w-3 flex-shrink-0 cursor-col-resize hover:bg-gray-700/30 transition-colors"
          onMouseDown={() => handleMouseDown('right')}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        ></div>

        {/* 右侧边栏 - Studio */}
        <div
          className="flex flex-col bg-[#171717] rounded-xl overflow-hidden"
          style={{ width: `${rightWidth}px` }}
        >
          {/* 顶部拖拽区域 */}
          <div
            className="h-14 flex items-center justify-center border-b border-gray-800/50"
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
          >
            <span
              className="text-sm text-gray-300"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
              Studio
            </span>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              <div className="p-4 bg-[#2a2a2a] rounded-lg">
                <p className="text-sm text-gray-400">右侧面板内容</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
