// ============================================
// src/components/ui/Table.jsx - Premium
// ============================================
import { motion } from 'framer-motion'

const Table = ({
  columns,
  data,
  className = '',
  loading = false,
  onRowClick,
  emptyMessage = 'Aucune donnée disponible',
  ...props
}) => {
  return (
    <div className={`overflow-x-auto rounded-xl border border-gray-100 ${className}`}>
      <table className="w-full text-sm" {...props}>
        <thead className="bg-secondary-50/50">
          <tr>
            {columns.map((col, index) => (
              <th
                key={col.key || index}
                className={`px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider ${col.className || ''}`}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-secondary-400">
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-primary-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Chargement...
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-secondary-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <motion.tr
                key={row.id || rowIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: rowIndex * 0.05 }}
                className={`border-b border-gray-50 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-primary-50/50' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key || colIndex} className={`px-4 py-3 ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
