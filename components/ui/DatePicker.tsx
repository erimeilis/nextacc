'use client'

import React, { useState, useEffect } from 'react'
import moment from 'moment'
import * as Dialog from '@radix-ui/react-dialog'
import { X, CaretLeft, CaretRight, Calendar } from '@phosphor-icons/react'
import clsx from 'clsx'
import { DatePickerProps } from '@/types/DatePickerTypes'

export default function DatePicker({ value, onChange, placeholder = 'Select date...', className = '' }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(moment().startOf('month'))
  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(value ? moment(value) : null)

  useEffect(() => {
    if (value) {
      setSelectedDate(moment(value))
    } else {
      setSelectedDate(null)
    }
  }, [value])

  const handleDateSelect = (date: moment.Moment) => {
    setSelectedDate(date)
    onChange(date.toDate())
    setOpen(false)
  }

  const handleClear = () => {
    setSelectedDate(null)
    onChange(null)
    setOpen(false)
  }

  const renderCalendarDays = () => {
    const daysInMonth = currentMonth.daysInMonth()
    const firstDayOfMonth = moment(currentMonth).startOf('month').day()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />)
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = moment(currentMonth).date(i)
      const isSelected = selectedDate && date.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD')
      const isToday = date.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')

      days.push(
        <button
          key={i}
          type="button"
          onClick={() => handleDateSelect(date)}
          className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm',
            isSelected && 'bg-primary text-primary-foreground',
            !isSelected && isToday && 'border border-primary text-primary',
            !isSelected && !isToday && 'hover:bg-muted'
          )}
        >
          {i}
        </button>
      )
    }

    return days
  }

  const prevMonth = () => {
    setCurrentMonth(moment(currentMonth).subtract(1, 'month'))
  }

  const nextMonth = () => {
    setCurrentMonth(moment(currentMonth).add(1, 'month'))
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={clsx(
            'flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary',
            className
          )}
        >
          <Calendar className="h-4 w-4" />
          <span className="flex-grow text-left">
            {selectedDate ? selectedDate.format('MMM DD, YYYY') : placeholder}
          </span>
          {selectedDate && (
            <X 
              className="h-4 w-4 opacity-70 hover:opacity-100" 
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }} 
            />
          )}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background p-6 rounded-lg shadow-lg z-50 w-[300px]">
          <div className="flex justify-between items-center mb-4">
            <button 
              type="button" 
              onClick={prevMonth}
              className="p-1 rounded-full hover:bg-muted"
            >
              <CaretLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-medium">
              {currentMonth.format('MMMM YYYY')}
            </h2>
            <button 
              type="button" 
              onClick={nextMonth}
              className="p-1 rounded-full hover:bg-muted"
            >
              <CaretRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>

          <div className="mt-4 flex justify-between">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1 text-sm rounded hover:bg-muted"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                handleDateSelect(moment())
              }}
              className="px-3 py-1 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Today
            </button>
          </div>

          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
