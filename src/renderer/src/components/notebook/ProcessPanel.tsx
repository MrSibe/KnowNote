import { useState, ReactElement } from 'react'
import { Send } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import MessageList from './chat/MessageList'

export default function ProcessPanel(): ReactElement {
  const [input, setInput] = useState('')
  const { currentSession, messages, isNotebookStreaming, sendMessage } = useChatStore()

  const currentNotebookId = currentSession?.notebookId
  const isCurrentNotebookStreaming = currentNotebookId
    ? isNotebookStreaming(currentNotebookId)
    : false
  const canSend = currentSession && !isCurrentNotebookStreaming && input.trim()

  const handleSend = (): void => {
    if (!canSend) return

    sendMessage(currentSession.id, input.trim())
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="relative flex flex-col bg-card rounded-xl overflow-hidden h-full mx-0">
      {/* 顶部标题栏 */}
      <div
        className="h-14 flex items-center justify-center border-b border-border/50 flex-shrink-0"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <span className="text-sm text-muted-foreground">
          {currentSession ? `${messages.length} 条消息` : '请选择或创建会话'}
        </span>
      </div>

      {/* 对话消息区域 - 使用 absolute 定位占满剩余空间 */}
      <div className="absolute top-14 bottom-0 left-0 right-0">
        <MessageList messages={messages} />
        {/* 底部渐变遮罩 - 创造输入框浮动效果 */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-10" />
      </div>

      {/* 底部输入区域 - 绝对定位浮动在底部 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none flex-shrink-0 z-20">
        <div className="relative bg-muted/95 backdrop-blur-md rounded-lg border border-border focus-within:ring-2 focus-within:ring-ring shadow-xl pointer-events-auto">
          {/* 多行输入框 */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentSession ? '输入消息... (Shift+Enter 换行)' : '请先选择会话'}
            disabled={!currentSession || isCurrentNotebookStreaming}
            rows={3}
            className="w-full bg-transparent pl-4 pr-14 py-3 text-sm outline-none text-foreground placeholder-muted-foreground resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* 发送按钮 */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="absolute right-2 bottom-3 p-2 bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}
