'use client'
import React, {useEffect, useMemo, useState} from 'react'
import {useTranslations} from 'next-intl'
import DateRangePicker from '@/components/ui/DateRangePicker'
import {FormattedDate} from '@/components/ui/FormattedDate'
import {SmsStatistics} from '@/types/Statistics'
import DataTable, {ColumnDef, FilterDef} from '@/components/ui/DataTable'
import moment from 'moment'
import ActionButton from '@/components/shared/ActionButton'
import Loader from '@/components/service/Loader'
import {getSmsStatistics, sendSmsStatistics} from '@/app/api/redreport/statistics'
import {useToast} from '@/hooks/use-toast'

// Define the filter type for SMS Statistics
type SmsStatisticsFilter = {
    dateRange: { start: Date | null, end: Date | null } | null
    did: string
}

interface SmsListProps {
    did?: string;
}

export default function SmsList({did}: SmsListProps) {
    const t = useTranslations('Statistics')
    const dateRangeT = useTranslations('daterange')
    const toastT = useTranslations('toast')
    const {toast} = useToast()

    // State
    const [localLoading, setLocalLoading] = useState<boolean>(false)
    const [smsStatistics, setSmsStatistics] = useState<SmsStatistics[] | null>(null)
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
            const stats = await getSmsStatistics(fromDate, toDate, did)
            setSmsStatistics(stats)
        } catch (error: unknown) {
            console.error(`${t('error_fetching_statistics')}:`, error)
            setSmsStatistics(null)
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

            const success = await sendSmsStatistics(fromDate, toDate, did)

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
                key: 'date' as keyof SmsStatistics,
                header: t('date'),
                cell: (item: SmsStatistics) => <FormattedDate date={item.date} showTime={true}/>,
                sortable: true,
                align: 'center' as const
            },
            {
                key: 'from_number' as keyof SmsStatistics,
                header: t('from_number'),
                cell: (item: SmsStatistics) => item.from_number,
                sortable: true
            },
            {
                key: 'to_number' as keyof SmsStatistics,
                header: t('to_number'),
                cell: (item: SmsStatistics) => item.to_number,
                sortable: true
            },
            {
                key: 'incoming_sms_stat' as keyof SmsStatistics,
                header: t('cost'),
                cell: (item: SmsStatistics) => item.incoming_sms_stat?.cost_sms,
                sortable: true,
                align: 'right' as const
            },
            {
                key: 'status' as keyof SmsStatistics,
                header: t('status'),
                cell: (item: SmsStatistics) => item.status,
                sortable: true
            },
            {
                key: 'sms_text' as keyof SmsStatistics,
                header: t('message'),
                cell: (item: SmsStatistics) => item.sms_text,
                sortable: true
            }
        ] as ColumnDef<SmsStatistics>[]
    }, [t])

    // Define filters for the DataTable
    const filters: FilterDef<SmsStatistics, SmsStatisticsFilter>[] = [
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
                    const itemDate = moment(item.date).startOf('day')

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
    const initialFilterValues: SmsStatisticsFilter = {
        dateRange: initialDateRange,
        did: ''
    }

    // Add a custom filter for the send to email button
    const allFilters: FilterDef<SmsStatistics, SmsStatisticsFilter>[] = [
        ...filters,
        {
            key: 'dateRange' as keyof SmsStatisticsFilter,
            label: '',
            component: <div></div>,
            applyFilter: () => true,
            renderWithClearButton: true
        }
    ]

    return (
        <>
            <DataTable
                data={smsStatistics}
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
                        disabled={isLoading || !smsStatistics || smsStatistics.length === 0}
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
