import { BrowserRouter } from 'react-router-dom'

import ErrorBoundary from './layouts/ErrorBoundary'
import AppRouter from './router'
import LiveSync from './components/realtime/LiveSync'
import PreferenceSync from './components/ui/PreferenceSync'
import ThemeWatcher from './components/ui/ThemeWatcher'
import AuthSessionBootstrap from './components/auth/AuthSessionBootstrap'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthSessionBootstrap>
          <ThemeWatcher />
          <PreferenceSync />
          <LiveSync />
          <AppRouter />
        </AuthSessionBootstrap>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
