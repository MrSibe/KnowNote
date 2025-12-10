import { HashRouter, Routes, Route } from 'react-router-dom'
import ChatLayout from './components/ChatLayout'
import NotebookList from './components/NotebookList'
import SettingsWindow from './components/SettingsWindow'

function App(): React.JSX.Element {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<NotebookList />} />
        <Route path="/chat/:id" element={<ChatLayout />} />
        <Route path="/settings" element={<SettingsWindow />} />
      </Routes>
    </HashRouter>
  )
}

export default App
