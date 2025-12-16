/**
 * 更新状态枚举
 */
export enum UpdateStatus {
  IDLE = 'idle',
  CHECKING = 'checking',
  AVAILABLE = 'available',
  NOT_AVAILABLE = 'not-available',
  DOWNLOADING = 'downloading',
  DOWNLOADED = 'downloaded',
  ERROR = 'error'
}

/**
 * 更新进度
 */
export interface UpdateProgress {
  percent: number
  transferred: number
  total: number
}

/**
 * 更新状态
 * info 字段使用 any 类型以兼容 electron-updater 的 UpdateInfo
 */
export interface UpdateState {
  status: UpdateStatus
  info?: any
  progress?: UpdateProgress
  error?: string
}

/**
 * 更新检查结果
 */
export interface UpdateCheckResult {
  success: boolean
  state?: UpdateState
  error?: string
}

/**
 * 更新操作结果
 */
export interface UpdateOperationResult {
  success: boolean
  error?: string
}
