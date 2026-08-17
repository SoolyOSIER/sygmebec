// ============================================
// src/components/ui/DataTable.jsx - Premium
// ============================================
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronDown, FiChevronUp, FiSearch, FiX } from 'react-icons/fi'
import Input from './Input'
import Pagination from './Pagination'
import Badge from './Badge'
import clsx from 'clsx'

export default function DataTable({
  columns,
  data,
  onRowClick,
  loading = false,
  pagination = true,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  searchable = false,
  searchPlaceholder = 'Rechercher...',
  onSearch,
  className,
}) {
  const [search, setSearch] = useState('')
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')

  const handleSort = (key) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(key)
      setSortDirection('asc')
    }
  }

  const handleSearch = (e) => {
    const value = e.target.value
    setSearch(value)
    if (onSearch) onSearch(value)
  }

  const clearSearch = () => {
    setSearch('')
    if (onSearch) onSearch('')
  }

  return (
    <div className={`bg-white rounded-2xl shadow-card border border-gray-100/80 overflow-hidden ${className}`}>
      {/* Search Bar */}
      {searchable && (
        <div className="flex items-center gap-3 p-4 border-b border-gray-100/80">
          <div className="flex-1 relative">
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={handleSearch}
              icon={FiSearch}
              className="pl-10"
            />
            {search && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-secondary-400 hover:text-secondary-600 transition-colors"
              >
                <FiX size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table-premium w-full">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    col.className,
                    col.sortable && 'cursor-pointer hover:bg-gray-100/50 transition-colors'
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortColumn === col.key && (
                      <span className="text-primary-500">
                        {sortDirection === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="wait">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-secondary-400 text-sm">Chargement des données...</span>
                    </div>
                  </td>
                </tr>
              ) : data?.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <FiSearch className="text-gray-300" size={24} />
                      </div>
                      <p className="text-secondary-400">Aucune donnée trouvée</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <motion.tr
                    key={item.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={onRowClick ? 'cursor-pointer' : ''}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={col.className}>
                        {col.render ? col.render(item[col.key], item) : item[col.key]}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && !loading && data?.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100/80">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </div>
  )
}