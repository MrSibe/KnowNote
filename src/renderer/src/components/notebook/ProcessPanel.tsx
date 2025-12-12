import { useState, useEffect, ReactElement } from 'react'
import { Send } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useNotebookStore } from '../../store/notebookStore'
import MessageList from './chat/MessageList'

export default function ProcessPanel(): ReactElement {
  const [input, setInput] = useState('')
  const [hasProvider, setHasProvider] = useState(true)
  const { currentSession, messages, isNotebookStreaming, sendMessage } = useChatStore()
  const { currentNotebook, updateNotebook } = useNotebookStore()

  const [editingTitle, setEditingTitle] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  const currentNotebookId = currentSession?.notebookId
  const isCurrentNotebookStreaming = currentNotebookId
    ? isNotebookStreaming(currentNotebookId)
    : false
  const canSend = currentSession && !isCurrentNotebookStreaming && input.trim() && hasProvider

  // Check if there are available providers
  const checkProvider = async (): Promise<void> => {
    try {
      const providers = await window.api.getAllProviderConfigs()
      const hasEnabledProvider = providers.some((p) => p.enabled)
      setHasProvider(hasEnabledProvider)
    } catch (error) {
      console.error('Failed to check Provider configuration:', error)
      setHasProvider(false)
    }
  }

  // Add useEffect listeners
  useEffect(() => {
    // 1. Check on page load
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void checkProvider()

    // 2. Listen for Provider configuration change events
    const cleanup = window.api.onProviderConfigChanged(() => {
      void checkProvider()
    })

    return cleanup
  }, [])

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

  // Start editing title
  const handleStartEditTitle = (): void => {
    if (currentNotebook) {
      setEditingTitle(currentNotebook.title)
      setIsEditingTitle(true)
    }
  }

  // Save title
  const handleSaveTitle = async (): Promise<void> => {
    if (!currentNotebook || !editingTitle.trim()) {
      setIsEditingTitle(false)
      return
    }

    if (editingTitle.trim() !== currentNotebook.title) {
      try {
        await updateNotebook(currentNotebook.id, { title: editingTitle.trim() })
      } catch (error) {
        console.error('Failed to update Notebook title:', error)
      }
    }

    setIsEditingTitle(false)
  }

  // Cancel editing
  const handleCancelEditTitle = (): void => {
    setIsEditingTitle(false)
    setEditingTitle('')
  }

  // Title input box key handler
  const handleTitleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      void handleSaveTitle()
    } else if (e.key === 'Escape') {
      handleCancelEditTitle()
    }
  }

  return (
    <div className="relative flex flex-col bg-card rounded-xl overflow-hidden h-full mx-0">
      {/* 顶部标题栏 */}
      <div
        className="h-14 flex items-center justify-center px-4 border-b border-border/50 flex-shrink-0"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        {currentNotebook ? (
          isEditingTitle ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              className="text-sm font-medium bg-transparent outline-none text-center min-w-0 max-w-full"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            />
          ) : (
            <button
              onClick={handleStartEditTitle}
              className="text-sm font-medium hover:text-primary transition-colors"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              title="点击编辑标题"
            >
              {currentNotebook.title}
            </button>
          )
        ) : (
          <span className="text-sm text-muted-foreground">请选择或创建笔记本</span>
        )}
      </div>

      {/* 对话消息区域 - 使用 absolute 定位占满剩余空间 */}
      <div className="absolute top-14 bottom-0 left-0 right-0">
        <MessageList messages={messages} />
      </div>

      {/* 底部输入区域 - 绝对定位浮动在底部 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none flex-shrink-0 z-20">
        <div className="relative bg-muted/95 backdrop-blur-md rounded-lg border border-border focus-within:ring-2 focus-within:ring-ring shadow-xl pointer-events-auto">
          {/* 多行输入框 */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              !currentSession
                ? '请先选择会话'
                : !hasProvider
                  ? '未配置 AI Provider，请在设置中配置'
                  : '输入消息... (Shift+Enter 换行)'
            }
            disabled={!currentSession || isCurrentNotebookStreaming || !hasProvider}
            rows={3}
            className="w-full bg-transparent pl-4 pr-14 py-3 text-sm outline-none text-foreground placeholder-muted-foreground resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* 发送按钮 */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            title={
              !hasProvider
                ? '未配置 AI Provider，请在设置中配置'
                : !currentSession
                  ? '请先选择会话'
                  : ''
            }
            className="absolute right-2 bottom-3 p-2 bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}
