/**
 * Notebook 卡片颜色池
 * 用于为不同的笔记本分配封面颜色
 */
export const NOTEBOOK_COVER_COLORS = [
  '#3b82f6', // 蓝色
  '#8b5cf6', // 紫色
  '#ec4899', // 粉色
  '#f59e0b', // 橙色
  '#10b981', // 绿色
  '#06b6d4' // 青色
] as const

/**
 * 根据索引获取笔记本颜色（循环使用）
 */
export function getNotebookColor(index: number): string {
  return NOTEBOOK_COVER_COLORS[index % NOTEBOOK_COVER_COLORS.length]
}
