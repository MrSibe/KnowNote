import { ReactElement, useEffect, useRef } from 'react'
import { MessageSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ChatMessage } from '../../../../../shared/types/chat'
import MessageItem from './MessageItem'
import { ScrollArea } from '../../ui/scroll-area'
import './messageList.css'

interface MessageListProps {
  messages: ChatMessage[]
}

export default function MessageList({ messages }: MessageListProps): ReactElement {
  const bottomRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  // 自动滚动到底部
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // 空状态
  if (messages.length === 0) {
    return (
      <ScrollArea className="h-full" viewportClassName="h-full">
        <div className="flex min-h-full flex-col items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <MessageSquare className="w-16 h-16 opacity-20" />
            <div className="text-center">
              <p className="text-lg font-medium mb-1">{t('ui:newChat')}</p>
              <p className="text-sm">{t('ui:noMessages')}</p>
            </div>
          </div>
        </div>
      </ScrollArea>
    )
  }

  // 消息列表
  return (
    <ScrollArea className="h-full" viewportClassName="message-list-fade">
      <div className="px-4 py-6 pb-32">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
          {/* 滚动锚点 */}
          <div ref={bottomRef} />
        </div>
      </div>
    </ScrollArea>
  )
}
