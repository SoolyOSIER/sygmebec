import { BrowserRouter } from 'react-router-dom'

import ErrorBoundary from './layouts/ErrorBoundary'
import AppRouter from './router'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
