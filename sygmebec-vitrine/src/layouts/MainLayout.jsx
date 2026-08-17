import { Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'
import { useUIStore } from '../store/uiStore.js'
import ErrorBoundary from './ErrorBoundary'

export default function MainLayout() {
  const { sidebarOpen } = useUIStore()

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Sidebar />

      <main
        className="transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '288px' : '80px' }}
      >
        <div className="px-6 py-8 max-w-7xl mx-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
