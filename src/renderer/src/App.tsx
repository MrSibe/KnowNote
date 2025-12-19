import { useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import NotebookLayout from './components/notebook/NotebookLayout'
import NotebookList from './components/pages/NotebookList'
import MindMapPage from './components/pages/MindMapPage'
import SettingsWindow from './components/settings/SettingsWindow'
import { setupChatListeners } from './store/chatStore'
import { useThemeStore } from './store/themeStore'
import { useNotebookStore } from './store/notebookStore'
import { useI18nStore } from './store/i18nStore'
import i18n from './i18n'

function App(): React.JSX.Element {
  const initTheme = useThemeStore((state) => state.initTheme)
  const loadNotebooks = useNotebookStore((state) => state.loadNotebooks)
  const { language, initLanguage } = useI18nStore()

  // 初始化聊天监听器
  useEffect(() => {
    const cleanup = setupChatListeners()
    return cleanup
  }, [])

  // 初始化主题
  useEffect(() => {
    initTheme()
  }, [initTheme])

  // 初始化语言
  useEffect(() => {
    initLanguage()
  }, [initLanguage])

  // 监听语言变化
  useEffect(() => {
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language)
    }
  }, [language])

  // 初始化笔记本数据（从数据库加载）
  useEffect(() => {
    console.log('[App] Loading notebooks on startup...')
    loadNotebooks().catch((error) => {
      console.error('[App] Failed to load notebooks:', error)
    })
  }, [loadNotebooks])

  return (
    <I18nextProvider i18n={i18n}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<NotebookList />} />
          <Route path="/notebook/:id" element={<NotebookLayout />} />
          <Route path="/mindmap/:notebookId" element={<MindMapPage />} />
          <Route path="/mindmap/view/:mindMapId" element={<MindMapPage />} />
          <Route path="/settings" element={<SettingsWindow />} />
        </Routes>
      </HashRouter>
    </I18nextProvider>
  )
}

export default App
