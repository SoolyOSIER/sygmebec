// ============================================
// src/components/ui/Tabs.jsx - Premium
// ============================================
import { useState } from 'react'
import { motion } from 'framer-motion'

const Tabs = ({ tabs, defaultTab, className = '', onTabChange }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    onTabChange?.(tabId)
  }

  return (
    <div className={className}>
      <div className="flex gap-1 border-b border-gray-100 mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                transition-colors duration-200 whitespace-nowrap
                ${isActive ? 'text-primary-600' : 'text-secondary-500 hover:text-secondary-700'}
              `}
            >
              {Icon && <Icon size={16} />}
              {tab.label}
              {tab.badge && (
                <span className="ml-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-600">
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          )
        })}
      </div>
      <div className="tab-content">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}

export default Tabs
