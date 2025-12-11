import { useState } from 'react'
import { Send } from 'lucide-react'

export interface ProcessPanelProps {
  messages?: string[]
}

export default function ProcessPanel({ messages = [] }: ProcessPanelProps) {
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    // TODO: 实现发送消息逻辑
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col bg-[#171717] rounded-xl overflow-hidden h-full mx-0">
      {/* 顶部标题栏 */}
      <div
        className="h-14 flex items-center justify-center border-b border-gray-800/50"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <span className="text-sm text-gray-400">{messages.length} 条消息</span>
      </div>

      {/* 对话消息区域 */}
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
      <div className="p-4">
        <div className="relative bg-[#2a2a2a] rounded-lg border border-gray-700 focus-within:border-gray-600">
          {/* 输入框 */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            className="w-full bg-transparent pl-4 pr-14 py-3 text-sm outline-none text-gray-100 placeholder-gray-500"
          />

          {/* 发送按钮 */}
          <button
            onClick={handleSend}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
