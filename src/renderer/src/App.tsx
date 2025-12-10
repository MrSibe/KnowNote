import { HashRouter, Routes, Route } from 'react-router-dom'
import ChatLayout from './components/ChatLayout'
import NotebookList from './components/NotebookList'

function App(): React.JSX.Element {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<NotebookList />} />
        <Route path="/chat/:id" element={<ChatLayout />} />
      </Routes>
    </HashRouter>
  )
}

export default App
