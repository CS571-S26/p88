import './App.css'
import { Routes, Route } from 'react-router-dom'
import QueueTestPage from './pages/HomePage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import Layout from './components/Layout.jsx'
import { QueueProvider } from './contexts/QueueContext.jsx'

function App() {
  return (
    <QueueProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<QueueTestPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </QueueProvider>
  )
}

export default App