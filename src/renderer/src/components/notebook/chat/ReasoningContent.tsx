import { ReactElement, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import { ScrollArea } from '../../ui/scroll-area'

interface ReasoningContentProps {
  content: string
  isStreaming: boolean
}

export default function ReasoningContent({
  content,
  isStreaming
}: ReasoningContentProps): ReactElement {
  const [isExpanded, setIsExpanded] = useState(false)

  // 如果没有内容且不在流式传输，不显示
  if (!content && !isStreaming) {
    return <></>
  }

  return (
    <div className="mb-2 border border-border rounded-lg overflow-hidden bg-muted/30">
      {/* 头部：展开/折叠按钮 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          {/* 思考图标 */}
          <svg
            className="w-3.5 h-3.5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>

          {/* 标题 */}
          <span className="font-medium text-foreground">
            {isStreaming ? '正在思考中...' : '思考过程'}
          </span>

          {/* 流式传输动画 */}
          {isStreaming && (
            <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          )}
        </div>

        {/* 展开/折叠图标 */}
        <svg
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 内容区域：展开时显示 */}
      {isExpanded && (
        <div className="border-t border-border">
          <ScrollArea className="max-h-96">
            <div className="px-3 py-2">
              {content ? (
                <div className="markdown-content text-xs text-muted-foreground">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeHighlight, rehypeKatex]}
                    components={{
                      a: ({ children, ...props }) => (
                        <a target="_blank" rel="noopener noreferrer" {...props}>
                          {children}
                        </a>
                      )
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                  {/* 流式传输光标 */}
                  {isStreaming && (
                    <span className="inline-block w-2 h-3 ml-1 bg-muted-foreground/50 animate-pulse" />
                  )}
                </div>
              ) : (
                // 空内容时显示占位符
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>思考中</span>
                  <span className="inline-block w-2 h-3 bg-muted-foreground/50 animate-pulse" />
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
