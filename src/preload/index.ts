import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

/**
 * IPC 调用超时包装函数
 * @param channel IPC 频道名称
 * @param timeout 超时时间（毫秒）
 * @param args 参数
 * @returns Promise
 */
async function invokeWithTimeout<T>(channel: string, timeout: number, ...args: any[]): Promise<T> {
  return Promise.race([
    ipcRenderer.invoke(channel, ...args),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`IPC调用超时: ${channel} (${timeout}ms)`)), timeout)
    )
  ])
}

// Custom APIs for renderer
const api = {
  // 窗口设置相关
  openSettings: () => ipcRenderer.invoke('open-settings'),

  // 应用设置相关
  settings: {
    getAll: () => ipcRenderer.invoke('settings:getAll'),
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    update: (updates: any) => ipcRenderer.invoke('settings:update', updates),
    set: (key: string, value: any) => ipcRenderer.invoke('settings:set', key, value),
    reset: () => ipcRenderer.invoke('settings:reset'),
    // 监听设置变化
    onSettingsChange: (callback: (newSettings: any, oldSettings: any) => void) => {
      const listener = (_event: any, newSettings: any, oldSettings: any) =>
        callback(newSettings, oldSettings)
      ipcRenderer.on('settings:changed', listener)
      // 返回清理函数
      return () => ipcRenderer.removeListener('settings:changed', listener)
    }
  },

  // Notebook 相关
  createNotebook: (title: string, description?: string) =>
    ipcRenderer.invoke('create-notebook', title, description),
  getAllNotebooks: () => ipcRenderer.invoke('get-all-notebooks'),
  getNotebook: (id: string) => ipcRenderer.invoke('get-notebook', id),
  updateNotebook: (id: string, updates: any) => ipcRenderer.invoke('update-notebook', id, updates),
  deleteNotebook: (id: string) => ipcRenderer.invoke('delete-notebook', id),

  // Chat Session 相关
  createChatSession: (notebookId: string, title: string) =>
    ipcRenderer.invoke('create-chat-session', notebookId, title),
  getChatSessions: (notebookId: string) => ipcRenderer.invoke('get-chat-sessions', notebookId),
  getActiveSession: (notebookId: string) => ipcRenderer.invoke('get-active-session', notebookId),
  updateSessionTitle: (sessionId: string, title: string) =>
    ipcRenderer.invoke('update-session-title', sessionId, title),
  deleteSession: (sessionId: string) => ipcRenderer.invoke('delete-session', sessionId),

  // Chat Message 相关
  getMessages: (sessionId: string) => invokeWithTimeout('get-messages', 10000, sessionId),
  sendMessage: (sessionId: string, content: string) =>
    invokeWithTimeout('send-message', 60000, sessionId, content), // 60秒超时（流式消息可能较长）

  // 流式消息监听
  onMessageChunk: (callback: (data: any) => void) => {
    const listener = (_event: any, data: any) => callback(data)
    ipcRenderer.on('message-chunk', listener)
    // 返回清理函数
    return () => ipcRenderer.removeListener('message-chunk', listener)
  },

  onMessageError: (callback: (data: any) => void) => {
    const listener = (_event: any, data: any) => callback(data)
    ipcRenderer.on('message-error', listener)
    return () => ipcRenderer.removeListener('message-error', listener)
  },

  // Session 自动切换监听
  onSessionAutoSwitched: (callback: (data: any) => void) => {
    const listener = (_event: any, data: any) => callback(data)
    ipcRenderer.on('session-auto-switched', listener)
    return () => ipcRenderer.removeListener('session-auto-switched', listener)
  },

  // Provider 配置相关
  saveProviderConfig: (config: any) => invokeWithTimeout('save-provider-config', 5000, config),
  getProviderConfig: (providerName: string) =>
    ipcRenderer.invoke('get-provider-config', providerName),
  getAllProviderConfigs: () => ipcRenderer.invoke('get-all-provider-configs'),
  validateProviderConfig: (providerName: string, config: any) =>
    invokeWithTimeout('validate-provider-config', 15000, providerName, config), // 15秒超时（网络验证）
  fetchModels: (providerName: string, apiKey: string) =>
    invokeWithTimeout('fetch-models', 15000, providerName, apiKey), // 15秒超时（网络请求）

  // Provider 配置变更监听
  onProviderConfigChanged: (callback: () => void) => {
    const listener = () => callback()
    ipcRenderer.on('provider-config-changed', listener)
    return () => ipcRenderer.removeListener('provider-config-changed', listener)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
