import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster, ToastBar, resolveValue } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'

import App from './App'
import './styles.css'
import { ThemeProvider } from './theme/ThemeProvider'
import { GlobalTranslator, useTranslation } from './i18n'

function LocalizedToaster() {
  const { t } = useTranslation()
  return <Toaster position="top-right">{(notification) => <ToastBar toast={notification}>{({ icon }) => <>{icon}<span>{t(resolveValue(notification.message, notification))}</span></>}</ToastBar>}</Toaster>
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <GlobalTranslator><App /></GlobalTranslator>
        <LocalizedToaster />
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
