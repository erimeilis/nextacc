'use client'
import React from 'react'
import {MoneyTransaction} from '@/types/MoneyTransaction'
import moment from 'moment'
import {Checkbox} from '@/components/ui/primitives/Checkbox'
import DateRangePicker from '@/components/ui/data/DateRangePicker'
import {useTranslations} from 'next-intl'
import {Input} from '@/components/ui/primitives/Input'
import {FormattedDate} from '@/components/ui/display/FormattedDate'
import BooleanDot from '@/components/ui/display/BooleanDot'
import DataTable, {ColumnDef, FilterDef} from '@/components/ui/data/DataTable'

// Skeleton loader for transactions list
function TransactionsSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            {/* Filters section */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/20 rounded-lg">
                <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-full"></div>
                </div>
                <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-16 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-full"></div>
                </div>
                <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-full"></div>
                </div>
            </div>

            {/* DataTable header */}
            <div className="overflow-x-auto">
                <div className="min-w-full">
                    <div className="flex w-full py-3 border-b border-border bg-muted/10">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex-1 px-4">
                                <div className="h-5 bg-muted rounded"></div>
                            </div>
                        ))}
                    </div>

                    {/* DataTable rows */}
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex w-full py-3 border-b border-border hover:bg-muted/5">
                            {[...Array(5)].map((_, j) => (
                                <div key={j} className="flex-1 px-4">
                                    <div className="h-4 bg-muted rounded"></div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* DataTable pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                <div className="flex items-center gap-2">
                    <div className="h-4 bg-muted rounded w-16"></div>
                    <div className="h-8 bg-muted rounded w-16"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-8 bg-muted rounded w-20"></div>
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-8 bg-muted rounded w-8"></div>
                        ))}
                    </div>
                    <div className="h-8 bg-muted rounded w-20"></div>
                </div>
            </div>
        </div>
    )
}

// Define the filter type for MoneyTransactions
type MoneyTransactionFilter = {
    startDate: Date | null | { start: Date | null, end: Date | null }
    amount: string
    operation: string
    description: string
    reseller: boolean
}

export default function MoneyTransactionsList({
                                                  options,
                                              }: {
    options: MoneyTransaction[] | null
}) {
    const t = useTranslations('daterange')
    const tr = useTranslations('transactions')

    // Define columns for the DataTable
    const columns: ColumnDef<MoneyTransaction>[] = [
        {
            key: 'datetime',
            header: tr('date_time'),
            cell: (item) => <FormattedDate date={item.datetime.toString()} showTime={true}/>,
            sortable: true,
            align: 'center'
        },
        {
            key: 'amount',
            header: tr('amount'),
            cell: (item) => (
                <span className="text-primary font-medium">
          {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2
          }).format(item.amount)}
        </span>
            ),
            sortable: true,
            align: 'center'
        },
        {
            key: 'operation',
            header: tr('operation'),
            cell: (item) => item.operation,
            sortable: true
        },
        {
            key: 'description',
            header: tr('description'),
            cell: (item) => item.description,
            sortable: true
        },
        {
            key: 'reseller',
            header: tr('reseller'),
            cell: (item) => <BooleanDot value={item.reseller}/>,
            sortable: true,
            align: 'center'
        }
    ]

    // Define filters for the DataTable
    const filters: FilterDef<MoneyTransaction, MoneyTransactionFilter>[] = [
        {
            key: 'startDate',
            label: t('filter_by_date'),
            component: (
                <DateRangePicker
                    startDate={null}
                    endDate={null}
                    placeholder={t('select_date_range')}
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

                // Fallback for backward compatibility
                const itemDate = moment(item.datetime).startOf('day')
                const startDate = filterValue && moment(filterValue).startOf('day')

                if (startDate && itemDate.isBefore(startDate)) {
                    return false
                }

                return true
            }
        },
        {
            key: 'operation',
            label: tr('operation'),
            component: (
                <Input
                    type="text"
                    placeholder={tr('filter_operation')}
                    className="h-8 text-xs"
                />
            ),
            applyFilter: (item, filterValue) => {
                if (!filterValue || typeof filterValue !== 'string') return true
                return item.operation.toLowerCase().includes(filterValue.toLowerCase())
            }
        },
        {
            key: 'description',
            label: tr('description'),
            component: (
                <Input
                    type="text"
                    placeholder={tr('filter_description')}
                    className="h-8 text-xs"
                />
            ),
            applyFilter: (item, filterValue) => {
                if (!filterValue || typeof filterValue !== 'string') return true
                return item.description.toLowerCase().includes(filterValue.toLowerCase())
            }
        },
        {
            key: 'reseller',
            label: tr('filter_reseller'),
            component: (
                <Checkbox
                    id="reseller-filter"
                    variant="sm"
                />
            ),
            applyFilter: (item, filterValue) => {
                // When filterValue is true, show only reseller=true records
                // When filterValue is false, show only reseller=false records or null/undefined
                const itemResellerValue = item.reseller === true

                // Log the filter values to help diagnose the issue
                console.log('Reseller filter:', 'item.reseller =', item.reseller, 'itemResellerValue =', itemResellerValue, 'filterValue =', filterValue)

                // Invert the comparison to match the original behavior
                return itemResellerValue !== filterValue
            },
            renderWithClearButton: true
        }
    ]

    // Initial filter values
    const initialFilterValues: MoneyTransactionFilter = {
        startDate: null,
        amount: '',
        operation: '',
        description: '',
        reseller: false
    }

    return (
        <DataTable<MoneyTransaction, MoneyTransactionFilter>
            data={options}
            columns={columns}
            filters={filters}
            initialFilterValues={initialFilterValues}
            pagination={{
                itemsPerPage: 10,
                showPageNumbers: true,
                showItemCounts: true
            }}
            emptyMessage={tr('no_transactions')}
            loadingFallback={options === null ? <TransactionsSkeleton /> : options.length === 0 ? <div>{tr('empty_list')}</div> : undefined}
        />
    )
}
