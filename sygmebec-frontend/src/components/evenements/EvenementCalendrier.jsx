// src/components/evenements/EvenementCalendrier.jsx
import { useState, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns'
import { Link } from 'react-router-dom'
import { Badge } from '../ui/Badge'
import useT from '../../i18n/useT'

const EvenementCalendrier = ({ evenements = [] }) => {
  const { t, locale } = useT()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getEventsForDay = (date) => {
    return evenements.filter(e => {
      const eventDate = new Date(e.date_ev)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))
  }

  return (
    <div className="bg-white rounded-2xl shadow-elegant border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-navy-900">
          {new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(currentDate)}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="p-4">
        {/* Days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
            const monday = new Date(2024, 0, 1 + offset)
            const day = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(monday)
            return <div key={offset} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          })}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((date) => {
            const dayEvents = getEventsForDay(date)
            const isCurrentMonth = isSameMonth(date, currentDate)
            const isTodayDate = isToday(date)

            return (
              <div
                key={date.toISOString()}
                className={`min-h-[80px] p-1 rounded-xl transition-colors ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50/50'
                } ${isTodayDate ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
              >
                <div className={`text-sm font-medium ${isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}`}>
                  {format(date, 'd')}
                </div>
                <div className="space-y-0.5 mt-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <Link
                      key={event.id}
                      to={`/evenement/${event.id}`}
                      className="block"
                    >
                      <div className="text-[10px] bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded truncate hover:bg-primary-100 transition-colors">
                        {event.titre}
                      </div>
                    </Link>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-gray-400">
                      {t('events.otherEvents', { count: dayEvents.length - 2 })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary-50 rounded border border-primary-200" />
            {t('navigation.events')}
          </span>
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary-500 rounded-full border border-primary-300" />
            {t('events.today')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default EvenementCalendrier
