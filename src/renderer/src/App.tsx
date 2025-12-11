import { HashRouter, Routes, Route } from 'react-router-dom'
import NotebookLayout from './components/notebook/NotebookLayout'
import NotebookList from './components/pages/NotebookList'
import SettingsWindow from './components/settings/SettingsWindow'

function App(): React.JSX.Element {
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
