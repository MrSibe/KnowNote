import { useState, useEffect, useRef, ReactElement } from 'react'
import { Send, StopCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useChatStore } from '../../store/chatStore'
import { useNotebookStore } from '../../store/notebookStore'
import MessageList from './chat/MessageList'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

export default function ProcessPanel(): ReactElement {
  const { t } = useTranslation('ui')
  const [input, setInput] = useState('')
  const [hasProvider, setHasProvider] = useState(true)
  const [defaultChatModel, setDefaultChatModel] = useState<string | null>(null)
  const { currentSession, messages, isNotebookStreaming, sendMessage, abortMessage } =
    useChatStore()
  const { currentNotebook, updateNotebook } = useNotebookStore()

  const [editingTitle, setEditingTitle] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentNotebookId = currentSession?.notebookId
  const isCurrentNotebookStreaming = currentNotebookId
    ? isNotebookStreaming(currentNotebookId)
    : false
  const canSend =
    currentSession && !isCurrentNotebookStreaming && input.trim() && hasProvider && defaultChatModel
  const canStop = currentSession && isCurrentNotebookStreaming

  // Check if there are available providers and get default model
  const checkProvider = async (): Promise<void> => {
    try {
      const providers = await window.api.getAllProviderConfigs()
      const hasEnabledProvider = providers.some((p) => p.enabled)
      setHasProvider(hasEnabledProvider)

      // Get default chat model
      const defaultModel = await window.api.settings.get('defaultChatModel')
      setDefaultChatModel(defaultModel || null)
    } catch (error) {
      console.error('Failed to check Provider configuration:', error)
      setHasProvider(false)
      setDefaultChatModel(null)
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

    // 3. Listen for settings change events
    const cleanupSettings = window.api.settings.onSettingsChange((newSettings) => {
      setDefaultChatModel(newSettings.defaultChatModel || null)
    })

    return () => {
      cleanup()
      cleanupSettings()
    }
  }, [])

  const handleSend = (): void => {
    if (!canSend) return

    sendMessage(currentSession.id, input.trim())
    setInput('')
  }

  const handleStop = async (): Promise<void> => {
    if (!canStop || !currentNotebookId) return
    await abortMessage(currentNotebookId)
  }

  // Auto-resize textarea based on content
  const adjustTextareaHeight = (): void => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto'

    // Calculate new height with min and max constraints
    const minHeight = 84 // ~3 rows
    const maxHeight = 280 // ~10 rows
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)

    textarea.style.height = `${newHeight}px`
  }

  // Handle input change with auto-resize
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setInput(e.target.value)
    adjustTextareaHeight()
  }

  // Adjust height when input changes externally (e.g., after sending)
  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (isCurrentNotebookStreaming) {
        void handleStop()
      } else {
        handleSend()
      }
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
    <div className="relative flex flex-col bg-card rounded-xl overflow-hidden h-full mx-0 shadow-md">
      {/* 顶部标题栏 */}
      <div
        className="h-14 flex items-center justify-center px-4 border-b border-border/50 flex-shrink-0"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        {currentNotebook ? (
          isEditingTitle ? (
            <Input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              className="text-sm font-medium bg-transparent border-0 text-center min-w-0 max-w-full p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            />
          ) : (
            <Button
              onClick={handleStartEditTitle}
              variant="ghost"
              className="text-sm font-medium h-auto p-0"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              title={t('clickToEditTitle')}
            >
              {currentNotebook.title}
            </Button>
          )
        ) : (
          <span className="text-sm text-muted-foreground">{t('selectOrCreateNotebook')}</span>
        )}
      </div>

      {/* 对话消息区域 - 使用 absolute 定位占满剩余空间 */}
      <div className="absolute top-14 bottom-0 left-0 right-0 overflow-hidden">
        <MessageList messages={messages} />
      </div>

      {/* 底部输入区域 - 绝对定位浮动在底部 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none flex-shrink-0 z-20">
        <div className="relative bg-muted/95 backdrop-blur-md rounded-lg border border-border focus-within:ring-2 focus-within:ring-ring shadow-lg pointer-events-auto">
          {/* 多行输入框 */}
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              !currentSession
                ? t('selectSession')
                : !hasProvider
                  ? t('noProviderConfigured')
                  : !defaultChatModel
                    ? t('noDefaultModel')
                    : t('inputMessage')
            }
            disabled={
              !currentSession || isCurrentNotebookStreaming || !hasProvider || !defaultChatModel
            }
            rows={1}
            className="w-full bg-transparent border-0 pl-4 pr-14 py-3 text-sm text-foreground placeholder-muted-foreground resize-none focus-visible:ring-0 focus-visible:ring-offset-0 overflow-y-auto min-h-[84px] max-h-[280px]"
          />

          {/* 发送/停止按钮 - 动态切换 */}
          {isCurrentNotebookStreaming ? (
            // 停止按钮
            <Button
              onClick={handleStop}
              disabled={!canStop}
              title="停止生成"
              variant="destructive"
              size="icon"
              className="absolute right-2 bottom-3 w-10 h-10"
            >
              <StopCircle className="w-4 h-4" />
            </Button>
          ) : (
            // 发送按钮
            <Button
              onClick={handleSend}
              disabled={!canSend}
              title={
                !hasProvider ? t('noProviderConfigured') : !currentSession ? t('selectSession') : ''
              }
              size="icon"
              className="absolute right-2 bottom-3 w-10 h-10"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
