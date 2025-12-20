import { useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import * as dagre from '@dagrejs/dagre'
import { useMindMapStore } from '../../../store/mindmapStore'
import CustomNode, { CustomNodeData } from './CustomNode'
import type { MindMap } from '../../../../../main/db/schema'
import type { MindMapTreeNode } from '../../../../../shared/types/mindmap'

// 节点尺寸配置
const NODE_WIDTH = 150
const NODE_HEIGHT = 50

// 使用 Dagre 算法布局节点
function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'LR'
): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  const isHorizontal = direction === 'LR'

  // 设置图的布局方向
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 100, // 同一层级节点之间的间距
    ranksep: 250, // 不同层级之间的间距
    marginx: 50,
    marginy: 50
  })

  // 添加节点到 dagre 图
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  })

  // 添加边到 dagre 图
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  // 计算布局
  dagre.layout(dagreGraph)

  // 更新节点位置和连接点方向
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      targetPosition: (isHorizontal ? Position.Left : Position.Top) as Position,
      sourcePosition: (isHorizontal ? Position.Right : Position.Bottom) as Position,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2
      }
    }
  })

  return { nodes: layoutedNodes, edges }
}

// 将树结构转换为 React Flow 的 nodes 和 edges
function treeToFlowElements(
  mindMap: MindMap,
  direction: 'TB' | 'LR' = 'LR'
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  // Drizzle ORM 已经自动处理了 JSON 解析，无需手动 JSON.parse
  const treeData = mindMap.treeData as unknown as MindMapTreeNode

  function traverse(node: MindMapTreeNode, level: number, parentId: string | null) {
    nodes.push({
      id: node.id,
      type: 'custom',
      position: { x: 0, y: 0 }, // 初始位置，将由 dagre 计算
      data: { label: node.label, level, direction, metadata: node.metadata } as CustomNodeData
      // sourcePosition 和 targetPosition 将在 getLayoutedElements 中设置
    })

    if (parentId) {
      edges.push({
        id: `${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: 'simplebezier',
        animated: false,
        style: {
          stroke: '#94a3b8',
          strokeWidth: 2
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#94a3b8'
        }
      })
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        traverse(child, level + 1, node.id)
      })
    }
  }

  traverse(treeData, 0, null)

  // 使用 Dagre 算法计算布局
  return getLayoutedElements(nodes, edges, direction)
}

interface MindMapCanvasProps {
  mindMap: MindMap
  direction?: 'TB' | 'LR'
}

export default function MindMapCanvas({ mindMap, direction = 'LR' }: MindMapCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const { loadNodeChunks } = useMindMapStore()

  // 定义自定义节点类型
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), [])

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = treeToFlowElements(mindMap, direction)
    setNodes(newNodes)
    setEdges(newEdges)
  }, [mindMap, direction, setNodes, setEdges])

  const handleNodeClick = async (_: React.MouseEvent, node: Node) => {
    await loadNodeChunks(mindMap.id, node.id)
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.1,
          maxZoom: 1.5
        }}
        minZoom={0.1}
        maxZoom={2}
        preventScrolling={true}
        defaultEdgeOptions={{
          type: 'simplebezier',
          animated: false,
          style: { stroke: '#94a3b8', strokeWidth: 2 }
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} size={1} />
        <Controls
          showInteractive={false}
          position="bottom-left"
          style={{
            bottom: '20px',
            left: '20px'
          }}
        />
      </ReactFlow>
    </div>
  )
}
