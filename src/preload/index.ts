import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

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

  // Chat Session 相关
  createChatSession: (notebookId: string, title: string) =>
    ipcRenderer.invoke('create-chat-session', notebookId, title),
  getChatSessions: (notebookId: string) => ipcRenderer.invoke('get-chat-sessions', notebookId),
  getActiveSession: (notebookId: string) => ipcRenderer.invoke('get-active-session', notebookId),
  updateSessionTitle: (sessionId: string, title: string) =>
    ipcRenderer.invoke('update-session-title', sessionId, title),
  deleteSession: (sessionId: string) => ipcRenderer.invoke('delete-session', sessionId),

  // Chat Message 相关
  getMessages: (sessionId: string) => ipcRenderer.invoke('get-messages', sessionId),
  sendMessage: (sessionId: string, content: string) =>
    ipcRenderer.invoke('send-message', sessionId, content),

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
  saveProviderConfig: (config: any) => ipcRenderer.invoke('save-provider-config', config),
  getProviderConfig: (providerName: string) =>
    ipcRenderer.invoke('get-provider-config', providerName),
  getAllProviderConfigs: () => ipcRenderer.invoke('get-all-provider-configs'),
  validateProviderConfig: (providerName: string, config: any) =>
    ipcRenderer.invoke('validate-provider-config', providerName, config),
  fetchModels: (providerName: string, apiKey: string) =>
    ipcRenderer.invoke('fetch-models', providerName, apiKey)
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
