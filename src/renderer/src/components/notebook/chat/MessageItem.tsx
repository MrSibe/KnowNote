import { ReactElement, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import { BookPlus } from 'lucide-react'
import type { ChatMessage } from '../../../types/notebook'
import ReasoningContent from './ReasoningContent'
import { useNoteStore } from '../../../store/noteStore'
import { useNotebookStore } from '../../../store/notebookStore'
import 'highlight.js/styles/github-dark.css'
import 'katex/dist/katex.min.css'
import './markdown.css'

interface MessageItemProps {
  message: ChatMessage
}

export default function MessageItem({ message }: MessageItemProps): ReactElement {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'
  const isStreaming = message.isStreaming || false
  const [copied, setCopied] = useState(false)
  const [addedToNote, setAddedToNote] = useState(false)

  const { createNote } = useNoteStore()
  const { currentNotebook } = useNotebookStore()

  // Copy message content
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Add to note
  const handleAddToNote = async () => {
    if (!currentNotebook) return

    try {
      await createNote(currentNotebook.id, message.content)
      setAddedToNote(true)
      setTimeout(() => setAddedToNote(false), 2000)
    } catch (error) {
      console.error('Failed to add to note:', error)
    }
  }

  // System message: centered notification box
  if (isSystem) {
    return (
      <div className="flex justify-center mb-4">
        <div className="max-w-[90%] bg-muted border border-border text-muted-foreground rounded-xl px-4 py-3">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p(props) {
                  const { children, ...rest } = props
                  return (
                    <p className="text-sm whitespace-pre-wrap break-words m-0" {...rest}>
                      {children}
                    </p>
                  )
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    )
  }

  if (isUser) {
    // User message: blue background, right-aligned
    return (
      <div className="flex justify-end mb-4 group">
        <div className="flex flex-col max-w-[80%]">
          <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-3">
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="self-end mt-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
            title={copied ? '已复制' : '复制'}
          >
            {copied ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>已复制</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>复制</span>
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // AI message: no background, left-aligned, Markdown rendered
  return (
    <div className="flex justify-start mb-4 group">
      <div className="flex flex-col max-w-[90%]">
        {/* Reasoning process display - only shown when reasoning content exists */}
        {message.reasoningContent && (
          <ReasoningContent
            content={message.reasoningContent}
            isStreaming={message.isReasoningStreaming || false}
          />
        )}

        {message.content ? (
          <div className="markdown-content text-foreground px-2">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeHighlight, rehypeKatex]}
              components={{
                // Links: open in new tab
                a: ({ children, ...props }) => (
                  <a target="_blank" rel="noopener noreferrer" {...props}>
                    {children}
                  </a>
                )
              }}
            >
              {message.content}
            </ReactMarkdown>
            {/* Streaming message cursor */}
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-muted-foreground animate-pulse" />
            )}
          </div>
        ) : (
          // Show cursor when message is empty
          <div className="flex items-center gap-2 px-2">
            <span className="text-sm text-muted-foreground">正在思考</span>
            <span className="inline-block w-2 h-4 bg-muted-foreground animate-pulse" />
          </div>
        )}
        {/* Action buttons - only shown when reply is complete and has content */}
        {message.content && !isStreaming && (
          <div className="flex items-center gap-2 self-start ml-2 mt-1">
            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
              title={copied ? '已复制' : '复制'}
            >
              {copied ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>已复制</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span>复制</span>
                </>
              )}
            </button>

            {/* Add to note button */}
            <button
              onClick={handleAddToNote}
              className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
              title={addedToNote ? '已添加到笔记' : '添加到笔记'}
            >
              {addedToNote ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>已添加</span>
                </>
              ) : (
                <>
                  <BookPlus className="w-3 h-3" />
                  <span>添加到笔记</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
