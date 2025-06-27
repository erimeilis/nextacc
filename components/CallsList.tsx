'use client'
import React, {useEffect, useMemo, useState} from 'react'
import {useTranslations} from 'next-intl'
import DateRangePicker from '@/components/ui/DateRangePicker'
import {FormattedDate} from '@/components/ui/FormattedDate'
import {CallStatistics} from '@/types/Statistics'
import DataTable, {ColumnDef, FilterDef} from '@/components/ui/DataTable'
import moment from 'moment'
import ActionButton from '@/components/shared/ActionButton'
import Loader from '@/components/service/Loader'
import {getCallStatistics, sendCallStatistics} from '@/app/api/redreport/statistics'
import {useToast} from '@/hooks/use-toast'

// Define the filter type for Call Statistics
type CallStatisticsFilter = {
    dateRange: { start: Date | null, end: Date | null } | null
}

interface CallsListProps {
    did?: string;
}

export default function CallsList({did}: CallsListProps) {
    const t = useTranslations('Statistics')
    const dateRangeT = useTranslations('daterange')
    const toastT = useTranslations('toast')
    const {toast} = useToast()

    // State
    const [localLoading, setLocalLoading] = useState<boolean>(false)
    const [callStatistics, setCallStatistics] = useState<CallStatistics[] | null>(null)
    const isLoading = localLoading

    // Initial date range for filtering
    const initialDateRange = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date()
    }

    // No need for client store anymore as we're fetching directly from API

    // Fetch data on component mount or when did changes
    useEffect(() => {
        void fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [did])

    const fetchData = async () => {
        setLocalLoading(true)
        try {
            const fromDate = initialDateRange.start ? initialDateRange.start.toISOString() : undefined
            const toDate = initialDateRange.end ? initialDateRange.end.toISOString() : undefined
            const stats = await getCallStatistics(fromDate, toDate, did)
            setCallStatistics(stats)
        } catch (error: unknown) {
            console.error(`${t('error_fetching_statistics')}:`, error)
            setCallStatistics(null)
        } finally {
            setLocalLoading(false)
        }
    }

    const handleSendEmail = async () => {
        setLocalLoading(true)
        try {
            // Get the current filter values from the DataTable
            // For now, we'll use the initialDateRange
            const fromDate = initialDateRange.start ? initialDateRange.start.toISOString() : undefined
            const toDate = initialDateRange.end ? initialDateRange.end.toISOString() : undefined

            const success = await sendCallStatistics(fromDate, toDate, did)

            if (success) {
                toast({
                    variant: 'default',
                    title: toastT('success_title'),
                    description: t('email_sent_success')
                })
            } else {
                toast({
                    variant: 'destructive',
                    title: toastT('error_title'),
                    description: t('email_sent_error')
                })
            }
        } catch (error: unknown) {
            console.error(`${t('error_sending_email')}:`, error)
            toast({
                variant: 'destructive',
                title: toastT('error_title'),
                description: t('email_sent_error')
            })
        } finally {
            setLocalLoading(false)
        }
    }

    // Define columns for the DataTable
    const columns = useMemo(() => {
        return [
            {
                key: 'datetime' as keyof CallStatistics,
                header: t('date'),
                cell: (item: CallStatistics) => <FormattedDate date={item.datetime} showTime={true}/>,
                sortable: true,
                align: 'center' as const
            },
            {
                key: 'caller_id' as keyof CallStatistics,
                header: t('caller_id'),
                cell: (item: CallStatistics) => item.caller_id,
                sortable: true
            },
            {
                key: 'virtual_number' as keyof CallStatistics,
                header: t('virtual_number'),
                cell: (item: CallStatistics) => item.virtual_number,
                sortable: true
            },
            {
                key: 'forwarding' as keyof CallStatistics,
                header: t('forwarding'),
                cell: (item: CallStatistics) => item.forwarding,
                sortable: true
            },
            {
                key: 'duration' as keyof CallStatistics,
                header: t('duration'),
                cell: (item: CallStatistics) => `${item.duration}s`,
                sortable: true,
                align: 'center' as const
            },
            {
                key: 'cost' as keyof CallStatistics,
                header: t('cost'),
                cell: (item: CallStatistics) => item.cost,
                sortable: true,
                align: 'right' as const
            },
            {
                key: 'status' as keyof CallStatistics,
                header: t('status'),
                cell: (item: CallStatistics) => item.status,
                sortable: true
            }
        ] as ColumnDef<CallStatistics>[]
    }, [t])

    // Define filters for the DataTable
    const filters: FilterDef<CallStatistics, CallStatisticsFilter>[] = [
        {
            key: 'dateRange',
            label: dateRangeT('filter_by_date'),
            component: (
                <DateRangePicker
                    startDate={initialDateRange.start}
                    endDate={initialDateRange.end}
                    placeholder={dateRangeT('select_date_range')}
                    className="w-full h-8 text-xs"
                    onRangeChangeAction={() => {
                    }} // This will be overridden by DataTable
                />
            ),
            applyFilter: (item, filterValue) => {
                if (!filterValue) return true

                // Handle the case when filterValue is an object with start and end dates
                if (typeof filterValue === 'object' && filterValue !== null) {
                    const {start, end} = filterValue as { start: Date | null, end: Date | null }
                    const itemDate = moment(item.datetime).startOf('day')

                    // Check if item date is within the range
                    if (start && moment(start).startOf('day') && itemDate.isBefore(moment(start).startOf('day'))) {
                        return false
                    }

                    if (end && moment(end).startOf('day') && itemDate.isAfter(moment(end).startOf('day'))) {
                        return false
                    }

                    return true
                }

                return true
            }
        }
    ]

    // Initial filter values
    const initialFilterValues: CallStatisticsFilter = {
        dateRange: initialDateRange
    }

    // Add a custom filter for the send to email button
    const allFilters: FilterDef<CallStatistics, CallStatisticsFilter>[] = [
        ...filters,
        {
            key: 'dateRange' as keyof CallStatisticsFilter,
            label: '',
            component: <div></div>,
            applyFilter: () => true,
            renderWithClearButton: true
        }
    ]

    return (
        <>
            <DataTable
                data={callStatistics}
                columns={columns}
                filters={allFilters}
                initialFilterValues={initialFilterValues}
                pagination={{
                    itemsPerPage: 10,
                    showPageNumbers: true,
                    showItemCounts: true
                }}
                emptyMessage={t('no_data')}
                loadingFallback={isLoading ? <Loader height={32}/> : undefined}
                renderExtraFilterButtons={() => (
                    <ActionButton
                        onClick={handleSendEmail}
                        disabled={isLoading || !callStatistics || callStatistics.length === 0}
                        type="button"
                        className="text-xs sm:text-sm ml-2"
                    >
                        {t('send_to_email')}
                    </ActionButton>
                )}
            />
        </>
    )
}
