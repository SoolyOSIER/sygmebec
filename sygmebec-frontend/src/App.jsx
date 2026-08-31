import { BrowserRouter } from 'react-router-dom'

import ErrorBoundary from './layouts/ErrorBoundary'
import AppRouter from './router'
import LiveSync from './components/realtime/LiveSync'
import ThemeWatcher from './components/ui/ThemeWatcher'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeWatcher />
        <LiveSync />
        <AppRouter />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
