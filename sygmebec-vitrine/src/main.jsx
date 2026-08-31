import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'

import App from './App'
import './styles.css'
import { ThemeProvider } from './theme/ThemeProvider'
import { GlobalTranslator } from './i18n'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <GlobalTranslator><App /></GlobalTranslator>
        <Toaster position="top-right" />
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
