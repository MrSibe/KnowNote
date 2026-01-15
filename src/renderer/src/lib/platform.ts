/**
 * 平台检测工具
 * 使用主进程的 process.platform 替代废弃的 navigator.platform
 */

// 缓存平台信息，避免重复 IPC 调用
let cachedPlatform: string | null = null

/**
 * 异步获取平台信息（推荐）
 * 从主进程获取准确的平台信息并缓存
 */
export async function getPlatform(): Promise<string> {
  if (cachedPlatform) return cachedPlatform
  cachedPlatform = await window.api.getPlatform()
  return cachedPlatform
}

/**
 * 同步获取平台信息
 * 使用 userAgentData（现代标准）或缓存值
 * 如果都不可用，回退到 navigator.platform
 */
export function getPlatformSync(): 'darwin' | 'win32' | 'linux' | 'unknown' {
  // 优先使用缓存
  if (cachedPlatform) {
    return cachedPlatform as 'darwin' | 'win32' | 'linux' | 'unknown'
  }

  // 使用 userAgentData（现代标准，chromium 90+）
  const ua = (navigator as any).userAgentData
  if (ua?.platform) {
    const platform = ua.platform.toLowerCase()
    if (platform.includes('mac')) return 'darwin'
    if (platform.includes('win')) return 'win32'
    if (platform.includes('linux')) return 'linux'
  }

  // 最后备选：旧版 navigator.platform（兼容性考虑）
  const p = navigator.platform.toUpperCase()
  if (p.includes('MAC')) return 'darwin'
  if (p.includes('WIN')) return 'win32'
  if (p.includes('LINUX')) return 'linux'

  return 'unknown'
}

/**
 * 判断是否为 macOS
 */
export const isMac = (): boolean => getPlatformSync() === 'darwin'

/**
 * 判断是否为 Windows
 */
export const isWindows = (): boolean => getPlatformSync() === 'win32'

/**
 * 判断是否为 Linux
 */
export const isLinux = (): boolean => getPlatformSync() === 'linux'

/**
 * 初始化平台检测
 * 在应用启动时调用，预加载平台信息到缓存
 */
export async function initPlatform(): Promise<void> {
  await getPlatform()
}
