import { useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import NotebookLayout from './components/notebook/NotebookLayout'
import NotebookList from './components/pages/NotebookList'
import SettingsWindow from './components/settings/SettingsWindow'
import { setupChatListeners } from './store/chatStore'
import { useThemeStore } from './store/themeStore'
import { useNotebookStore } from './store/notebookStore'

function App(): React.JSX.Element {
  const initTheme = useThemeStore((state) => state.initTheme)
  const loadNotebooks = useNotebookStore((state) => state.loadNotebooks)

  // 初始化聊天监听器
  useEffect(() => {
    const cleanup = setupChatListeners()
    return cleanup
  }, [])

  // 初始化主题
  useEffect(() => {
    initTheme()
  }, [initTheme])

  // 初始化笔记本数据（从数据库加载）
  useEffect(() => {
    console.log('[App] Loading notebooks on startup...')
    loadNotebooks().catch((error) => {
      console.error('[App] Failed to load notebooks:', error)
    })
  }, [loadNotebooks])

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<NotebookList />} />
        <Route path="/notebook/:id" element={<NotebookLayout />} />
        <Route path="/settings" element={<SettingsWindow />} />
      </Routes>
    </HashRouter>
  )
}

export default App
