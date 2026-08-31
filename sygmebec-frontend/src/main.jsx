// ============================================
// src/main.jsx - Version enrichie
// ============================================
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'
import I18nProvider from './i18n/I18nProvider'
import GlobalPageTranslator from './i18n/GlobalPageTranslator'

const savedTheme = localStorage.getItem('sygmebec-theme') || 'system'
const resolvedTheme = savedTheme === 'system'
  ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  : savedTheme
document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
document.documentElement.dataset.theme = resolvedTheme

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <I18nProvider><GlobalPageTranslator><App /></GlobalPageTranslator></I18nProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '16px',
            padding: '16px 20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
            duration: 4000,
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
            duration: 5000,
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
)
