export interface Notebook {
  id: string
  title: string
  description?: string
  coverColor: string // 卡片顶部装饰条颜色
  createdAt: Date
  updatedAt: Date
  chatCount: number // 对话数量
}
