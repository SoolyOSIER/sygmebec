import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button.jsx'

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 2) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {pages.map((p, idx) => (
        <Button
          key={idx}
          variant={p === page ? 'primary' : 'outline'}
          size="sm"
          disabled={p === '…'}
          onClick={() => typeof p === 'number' && onPageChange(p)}
          className="min-w-[36px]"
        >
          {p}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}