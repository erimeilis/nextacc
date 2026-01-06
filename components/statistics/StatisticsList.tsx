'use client'

import React, { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import DateRangePicker from '@/components/ui/data/DateRangePicker'
import { FormattedDate } from '@/components/ui/display/FormattedDate'
import { CallStatistics, SmsStatistics } from '@/types/Statistics'
import DataTable, { ColumnDef, FilterDef } from '@/components/ui/data/DataTable'
import moment from 'moment'
import ActionButton from '@/components/forms/ActionButton'
import Loader from '@/components/ui/loading/Loader'
import { useCallStats, useSendCallStats, useSmsStats, useSendSmsStats } from '@/hooks/queries/use-stats'
import { useToast } from '@/hooks/use-toast'

type StatisticsType = 'calls' | 'sms'
type StatisticsData = CallStatistics | SmsStatistics

type StatisticsFilter = {
    dateRange: { start: Date | null, end: Date | null } | null
}

interface StatisticsListProps {
    type: StatisticsType
    did?: string
}

function getInitialDateRange() {
    return {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
    }
}

export default function StatisticsList({ type, did }: StatisticsListProps) {
    const t = useTranslations('Statistics')
    const dateRangeT = useTranslations('daterange')
    const toastT = useTranslations('toast')
    const { toast } = useToast()

    const [initialDateRange] = useState(getInitialDateRange)

    // TanStack Query hooks - use based on type
    const queryParams = {
        startDate: initialDateRange.start.toISOString(),
        endDate: initialDateRange.end.toISOString(),
        did
    }

    const callStats = useCallStats(type === 'calls' ? queryParams : { startDate: '', endDate: '' })
    const smsStats = useSmsStats(type === 'sms' ? queryParams : { startDate: '', endDate: '' })
    const sendCallsMutation = useSendCallStats()
    const sendSmsMutation = useSendSmsStats()

    // Select the appropriate data and mutation based on type
    const { data, isLoading } = type === 'calls' ? callStats : smsStats
    const sendEmailMutation = type === 'calls' ? sendCallsMutation : sendSmsMutation

    const handleSendEmail = () => {
        sendEmailMutation.mutate({
            startDate: initialDateRange.start.toISOString(),
            endDate: initialDateRange.end.toISOString(),
            did
        }, {
            onSuccess: () => {
                toast({
                    variant: 'default',
                    title: toastT('success_title'),
                    description: t('email_sent_success')
                })
            },
            onError: (error) => {
                console.error(`${t('error_sending_email')}:`, error)
                toast({
                    variant: 'destructive',
                    title: toastT('error_title'),
                    description: t('email_sent_error')
                })
            }
        })
    }

    const isBusy = isLoading || sendEmailMutation.isPending

    // Define columns based on type
    const columns = useMemo(() => {
        if (type === 'calls') {
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
        } else {
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
        }
    }, [t, type])

    // Define filters
    const filters: FilterDef<StatisticsData, StatisticsFilter>[] = [
        {
            key: 'dateRange',
            label: dateRangeT('filter_by_date'),
            component: (
                <DateRangePicker
                    startDate={initialDateRange.start}
                    endDate={initialDateRange.end}
                    placeholder={dateRangeT('select_date_range')}
                    className="w-full h-8 text-xs"
                    onRangeChangeAction={() => {}}
                />
            ),
            applyFilter: (item, filterValue) => {
                if (!filterValue) return true

                if (typeof filterValue === 'object' && filterValue !== null) {
                    const { start, end } = filterValue as { start: Date | null, end: Date | null }
                    const dateValue = type === 'calls'
                        ? (item as CallStatistics).datetime
                        : (item as SmsStatistics).date
                    const itemDate = moment(dateValue).startOf('day')

                    if (start && itemDate.isBefore(moment(start).startOf('day'))) {
                        return false
                    }

                    if (end && itemDate.isAfter(moment(end).startOf('day'))) {
                        return false
                    }

                    return true
                }

                return true
            }
        }
    ]

    const initialFilterValues: StatisticsFilter = {
        dateRange: initialDateRange
    }

    const allFilters: FilterDef<StatisticsData, StatisticsFilter>[] = [
        ...filters,
        {
            key: 'dateRange' as keyof StatisticsFilter,
            label: '',
            component: <div></div>,
            applyFilter: () => true,
            renderWithClearButton: true
        }
    ]

    return (
        <DataTable
            data={data ?? null}
            columns={columns as ColumnDef<StatisticsData>[]}
            filters={allFilters}
            initialFilterValues={initialFilterValues}
            pagination={{
                itemsPerPage: 10,
                showPageNumbers: true,
                showItemCounts: true
            }}
            emptyMessage={t('no_data')}
            loadingFallback={isBusy ? <Loader height={32} /> : undefined}
            renderExtraFilterButtons={() => (
                <ActionButton
                    onClick={handleSendEmail}
                    disabled={isBusy || !data || data.length === 0}
                    type="button"
                    className="text-xs sm:text-sm ml-2"
                >
                    {t('send_to_email')}
                </ActionButton>
            )}
        />
    )
}
