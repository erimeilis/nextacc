'use client'

import React, {useEffect, useState} from 'react'
import moment from 'moment'
import * as Dialog from '@radix-ui/react-dialog'
import {CaretLeftIcon, CaretRightIcon, XIcon} from '@phosphor-icons/react'
import {CalendarDotsIcon} from '@phosphor-icons/react'
import clsx from 'clsx'
import {useTranslations} from 'next-intl'
import {VisuallyHidden} from '@radix-ui/react-visually-hidden'

type DateRangePickerProps = {
    startDate: Date | null
    endDate: Date | null
    onRangeChangeAction: (startDate: Date | null, endDate: Date | null) => void
    placeholder?: string
    className?: string
}

// Calendar component that can be reused for both start and end date
type CalendarProps = {
    currentMonth: moment.Moment
    selectedDate: moment.Moment | null
    otherSelectedDate: moment.Moment | null
    isStartCalendar: boolean
    onDateSelect: (date: moment.Moment) => void
    onPrevMonth: () => void
    onNextMonth: () => void
    title: string
}

function Calendar({
                      currentMonth,
                      selectedDate,
                      otherSelectedDate,
                      isStartCalendar,
                      onDateSelect,
                      onPrevMonth,
                      onNextMonth,
                      title
                  }: CalendarProps) {
    const t = useTranslations('daterange')

    const renderCalendarDays = () => {
        const daysInMonth = currentMonth.daysInMonth()
        const firstDayOfMonth = moment(currentMonth).startOf('month').day()

        const days = []

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="w-8 h-8"/>)
        }

        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const date = moment(currentMonth).date(i)
            const isSelected = selectedDate && date.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD')
            const isOtherSelected = otherSelectedDate && date.format('YYYY-MM-DD') === otherSelectedDate.format('YYYY-MM-DD')

            // Determine if the date is in range between start and end dates
            const isInRange = selectedDate && otherSelectedDate && (
                (isStartCalendar && date.isAfter(selectedDate) && date.isBefore(otherSelectedDate)) ||
                (!isStartCalendar && date.isAfter(otherSelectedDate) && date.isBefore(selectedDate))
            )

            const isToday = date.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')

            // Disable dates that don't make sense based on the other selected date
            const isDisabled = otherSelectedDate && (
                (isStartCalendar && date.isAfter(otherSelectedDate)) ||
                (!isStartCalendar && date.isBefore(otherSelectedDate))
            )

            days.push(
                <button
                    key={i}
                    type="button"
                    onClick={() => !isDisabled && onDateSelect(date)}
                    disabled={!!isDisabled}
                    className={clsx(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm',
                        isSelected && 'bg-primary text-primary-foreground',
                        isOtherSelected && 'bg-primary/70 text-primary-foreground',
                        isInRange && 'bg-primary/20',
                        !isSelected && !isOtherSelected && !isInRange && isToday && 'border border-primary text-primary',
                        !isSelected && !isOtherSelected && !isInRange && !isToday && !isDisabled && 'hover:bg-muted',
                        isDisabled && 'opacity-40 cursor-not-allowed'
                    )}
                >
                    {i}
                </button>
            )
        }

        return days
    }

    return (
        <div className="calendar-container">
            <div className="text-center text-sm mb-2">
                {title}
            </div>

            <div className="flex justify-between items-center mb-4">
                <button
                    type="button"
                    onClick={onPrevMonth}
                    className="p-1 rounded-full hover:bg-muted"
                    aria-label={t('previous_month')}
                >
                    <CaretLeftIcon className="h-5 w-5"/>
                </button>
                <h2 className="text-lg font-medium">
                    {t(currentMonth.format('MMMM').toLowerCase())} {currentMonth.format('YYYY')}
                </h2>
                <button
                    type="button"
                    onClick={onNextMonth}
                    className="p-1 rounded-full hover:bg-muted"
                    aria-label={t('next_month')}
                >
                    <CaretRightIcon className="h-5 w-5"/>
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {[t('sunday_short'), t('monday_short'), t('tuesday_short'), t('wednesday_short'), t('thursday_short'), t('friday_short'), t('saturday_short')].map((day) => (
                    <div key={day} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-muted-foreground">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
            </div>
        </div>
    )
}

export default function DateRangePicker({
                                            startDate,
                                            endDate,
                                            onRangeChangeAction,
                                            placeholder = 'Select date range...',
                                            className = ''
                                        }: DateRangePickerProps) {
    const t = useTranslations('daterange')
    const [open, setOpen] = useState(false)
    const [startMonth, setStartMonth] = useState(moment().startOf('month'))
    const [endMonth, setEndMonth] = useState(moment().add(1, 'month').startOf('month'))
    const [selectedStartDate, setSelectedStartDate] = useState<moment.Moment | null>(startDate ? moment(startDate) : null)
    const [selectedEndDate, setSelectedEndDate] = useState<moment.Moment | null>(endDate ? moment(endDate) : null)

    // Track previous props for render-time sync (React 19 pattern)
    const [prevStartDate, setPrevStartDate] = useState(startDate)
    const [prevEndDate, setPrevEndDate] = useState(endDate)

    // Sync state with props during render (React 19 approved pattern - no useEffect)
    if (startDate !== prevStartDate || endDate !== prevEndDate) {
        setPrevStartDate(startDate)
        setPrevEndDate(endDate)

        if (startDate) {
            setSelectedStartDate(moment(startDate))
            // If start date is selected, set the start calendar to that month
            setStartMonth(moment(startDate).startOf('month'))
        } else {
            setSelectedStartDate(null)
        }

        if (endDate) {
            setSelectedEndDate(moment(endDate))
            // If end date is selected, set the end calendar to that month
            setEndMonth(moment(endDate).startOf('month'))
        } else {
            setSelectedEndDate(null)
        }
    }

    const handleStartDateSelect = (date: moment.Moment) => {
        setSelectedStartDate(date)

        // If end date is before start date, clear it
        if (selectedEndDate && date.isAfter(selectedEndDate)) {
            setSelectedEndDate(null)
        }

        onRangeChangeAction(date.toDate(), selectedEndDate?.toDate() || null)
    }

    const handleEndDateSelect = (date: moment.Moment) => {
        setSelectedEndDate(date)

        // If start date is after end date, clear it
        if (selectedStartDate && date.isBefore(selectedStartDate)) {
            setSelectedStartDate(null)
        }

        onRangeChangeAction(selectedStartDate?.toDate() || null, date.toDate())
    }

    const handleClear = () => {
        setSelectedStartDate(null)
        setSelectedEndDate(null)
        onRangeChangeAction(null, null)
        setOpen(false)
    }

    const handleApply = () => {
        onRangeChangeAction(
            selectedStartDate?.toDate() || null,
            selectedEndDate?.toDate() || null
        )
        setOpen(false)
    }

    const formatDateRange = () => {
        if (selectedStartDate && selectedEndDate) {
            return `${selectedStartDate.format('ll')} - ${selectedEndDate.format('ll')}`
        } else if (selectedStartDate) {
            return `${selectedStartDate.format('ll')} - ${t('select_end_date')}`
        } else if (selectedEndDate) {
            return `${t('select_start_date')} - ${selectedEndDate.format('ll')}`
        } else {
            return placeholder
        }
    }

    // Set locale for a moment based on the current locale
    useEffect(() => {
        moment.locale(t('locale'))
    }, [t])

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <button
                    type="button"
                    className={clsx(
                        'flex items-center gap-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        className
                    )}
                >
                    <CalendarDotsIcon className="h-4 w-4"/>
                    <span className="flex-grow text-left">
            {formatDateRange()}
          </span>
                    {(selectedStartDate || selectedEndDate) && (
                        <XIcon
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
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50"/>
                <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background p-6 rounded-lg shadow-lg z-50 w-[650px] max-w-[95vw]">
                    {/* Add this line to fix the accessibility issue */}
                    <VisuallyHidden>
                        <Dialog.Title>{t('select_date_range')}</Dialog.Title>
                    </VisuallyHidden>
                    <div className="flex flex-col md:flex-row gap-6">
                        <Calendar
                            currentMonth={startMonth}
                            selectedDate={selectedStartDate}
                            otherSelectedDate={selectedEndDate}
                            isStartCalendar={true}
                            onDateSelect={handleStartDateSelect}
                            onPrevMonth={() => setStartMonth(moment(startMonth).subtract(1, 'month'))}
                            onNextMonth={() => setStartMonth(moment(startMonth).add(1, 'month'))}
                            title={t('select_start_date')}
                        />

                        <Calendar
                            currentMonth={endMonth}
                            selectedDate={selectedEndDate}
                            otherSelectedDate={selectedStartDate}
                            isStartCalendar={false}
                            onDateSelect={handleEndDateSelect}
                            onPrevMonth={() => setEndMonth(moment(endMonth).subtract(1, 'month'))}
                            onNextMonth={() => setEndMonth(moment(endMonth).add(1, 'month'))}
                            title={t('select_end_date')}
                        />
                    </div>

                    <div className="mt-6 flex justify-between">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-3 py-1 text-sm rounded hover:bg-muted"
                        >
                            {t('clear')}
                        </button>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const today = moment()
                                    setSelectedStartDate(today)
                                    setSelectedEndDate(today)
                                    onRangeChangeAction(today.toDate(), today.toDate())
                                    setOpen(false)
                                }}
                                className="px-3 py-1 text-sm rounded bg-muted hover:bg-muted/80"
                            >
                                {t('today')}
                            </button>
                            <button
                                type="button"
                                onClick={handleApply}
                                className="px-3 py-1 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {t('apply')}
                            </button>
                        </div>
                    </div>

                    <Dialog.Close asChild>
                        <button
                            type="button"
                            className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
                            aria-label={t('close')}
                        >
                            <XIcon className="h-4 w-4"/>
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
