import './App.css'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import SchedulingPage from './pages/SchedulingPage.jsx'
import ExecutionPage from './pages/ExecutionPage.jsx'
import StandupPage from './pages/StandupPage.jsx'
import MetricsPage from './pages/MetricsPage.jsx'
import RetryTasksPage from './pages/RetryTasksPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import Layout from './components/Layout.jsx'
import { QueueProvider } from './contexts/QueueContext.jsx'
import { RetryTasksProvider } from './contexts/RetryTasksContext.jsx'

function App() {
  return (
    <QueueProvider>
      <RetryTasksProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="scheduling" element={<SchedulingPage />} />
            <Route path="execution" element={<ExecutionPage />} />
            <Route path="standup" element={<StandupPage />} />
            <Route path="metrics" element={<MetricsPage />} />
            <Route path="retry" element={<RetryTasksPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </RetryTasksProvider>
    </QueueProvider>
  )
}

export default App