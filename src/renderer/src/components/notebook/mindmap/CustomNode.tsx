import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'

export interface CustomNodeData extends Record<string, unknown> {
  label: string
  level: number
  direction?: 'TB' | 'LR'
  metadata?: {
    level: number
    chunkIds: string[]
    keywords?: string[]
  }
}

function CustomNode({ data, sourcePosition, targetPosition }: NodeProps) {
  const nodeData = data as CustomNodeData
  const level = nodeData.level || 0

  // 根据层级选择不同的样式
  const getNodeStyle = (level: number) => {
    const baseStyle = {
      padding: '12px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 500,
      minWidth: '120px',
      textAlign: 'center' as const,
      border: '2px solid',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    }

    // 不同层级使用不同的图表颜色
    switch (level) {
      case 0: // 根节点 - 使用主色
        return {
          ...baseStyle,
          backgroundColor: 'var(--primary)',
          borderColor: 'var(--primary)',
          color: 'var(--primary-foreground)',
          fontWeight: 600,
          fontSize: '15px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }
      case 1: // 第一层 - 蓝色
        return {
          ...baseStyle,
          backgroundColor: 'var(--chart-1)',
          borderColor: 'var(--chart-1)',
          color: '#ffffff'
        }
      case 2: // 第二层 - 绿色
        return {
          ...baseStyle,
          backgroundColor: 'var(--chart-2)',
          borderColor: 'var(--chart-2)',
          color: '#ffffff'
        }
      case 3: // 第三层 - 红色
        return {
          ...baseStyle,
          backgroundColor: 'var(--chart-3)',
          borderColor: 'var(--chart-3)',
          color: '#ffffff'
        }
      case 4: // 第四层 - 黄色
        return {
          ...baseStyle,
          backgroundColor: 'var(--chart-4)',
          borderColor: 'var(--chart-4)',
          color: '#ffffff'
        }
      default: // 第五层及以上 - 紫色
        return {
          ...baseStyle,
          backgroundColor: 'var(--chart-5)',
          borderColor: 'var(--chart-5)',
          color: '#ffffff',
          fontSize: '13px'
        }
    }
  }

  return (
    <div style={getNodeStyle(level)}>
      <Handle
        type="target"
        position={targetPosition || Position.Left}
        style={{ opacity: 0 }}
        isConnectable={false}
      />
      {nodeData.label}
      <Handle
        type="source"
        position={sourcePosition || Position.Right}
        style={{ opacity: 0 }}
        isConnectable={false}
      />
    </div>
  )
}

export default memo(CustomNode)
