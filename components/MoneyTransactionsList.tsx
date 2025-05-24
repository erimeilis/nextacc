'use client'
import React, {useEffect, useMemo, useState} from 'react'
import Loader from './service/Loader'
import Show from '@/components/service/Show'
import {MoneyTransaction} from '@/types/MoneyTransaction'
import moment from 'moment'
import {ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Filter} from 'lucide-react'
import clsx from 'clsx'
import DateRangePicker from '@/components/ui/DateRangePicker'
import {useTranslations} from 'next-intl'

type SortDirection = 'asc' | 'desc' | null
type SortConfig = {
    key: keyof MoneyTransaction | null
    direction: SortDirection
}

type FilterConfig = {
    startDate: Date | null
    endDate: Date | null
    amount: string
    operation: string
    description: string
    reseller: boolean | null
}

const ITEMS_PER_PAGE = 10

export default function MoneyTransactionsList({
                                                  options,
                                              }: {
    options: MoneyTransaction[] | null
}) {
    const [sortConfig, setSortConfig] = useState<SortConfig>({key: null, direction: null})
    const t = useTranslations('daterange')
    const tr = useTranslations('transactions')
    const [filterConfig, setFilterConfig] = useState<FilterConfig>({
        startDate: null,
        endDate: null,
        amount: '',
        operation: '',
        description: '',
        reseller: null
    })
    const [currentPage, setCurrentPage] = useState(1)
    const [showFilters, setShowFilters] = useState(false)

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [filterConfig])

    const handleSort = (key: keyof MoneyTransaction) => {
        let direction: SortDirection = 'asc'

        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') {
                direction = 'desc'
            } else if (sortConfig.direction === 'desc') {
                direction = null
            }
        }

        setSortConfig({key, direction})
    }

    const handleFilterChange = (key: keyof FilterConfig, value: string | boolean | Date | null) => {
        setFilterConfig(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const filteredData = useMemo(() => {
        if (!options) return []

        return options.filter(item => {
            // Date range filter
            if (filterConfig.startDate &&
                moment(item.datetime).startOf('day').isBefore(moment(filterConfig.startDate).startOf('day'))) {
                return false
            }

            if (filterConfig.endDate &&
                moment(item.datetime).endOf('day').isAfter(moment(filterConfig.endDate).endOf('day'))) {
                return false
            }

            // Amount filter
            if (filterConfig.amount &&
                !item.amount.toString().includes(filterConfig.amount)) {
                return false
            }

            // Operation filter
            if (filterConfig.operation &&
                !item.operation.toLowerCase().includes(filterConfig.operation.toLowerCase())) {
                return false
            }

            // Description filter
            if (filterConfig.description &&
                !item.description.toLowerCase().includes(filterConfig.description.toLowerCase())) {
                return false
            }

            // Reseller filter
            if (filterConfig.reseller !== null &&
                item.reseller !== filterConfig.reseller) {
                return false
            }

            return true
        })
    }, [options, filterConfig])

    const sortedData = useMemo(() => {
        if (!sortConfig.key || sortConfig.direction === null) return filteredData

        return [...filteredData].sort((a, b) => {
            // Make sure sortConfig.key is not null before using it as an index
            if (sortConfig.key === null) return 0

            if (sortConfig.key === 'datetime') {
                const dateA = new Date(a[sortConfig.key]).getTime()
                const dateB = new Date(b[sortConfig.key]).getTime()
                return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA
            }

            if (sortConfig.key === 'amount') {
                return sortConfig.direction === 'asc'
                    ? a[sortConfig.key] - b[sortConfig.key]
                    : b[sortConfig.key] - a[sortConfig.key]
            }

            // Check if the key exists on the objects before comparing
            const aValue = a[sortConfig.key]
            const bValue = b[sortConfig.key]

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1
            }
            return 0
        })
    }, [filteredData, sortConfig])

    // Pagination
    const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE)
    const paginatedData = sortedData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    const renderSortIcon = (key: keyof MoneyTransaction) => {
        if (sortConfig.key !== key) {
            return <ChevronDown className="h-4 w-4 opacity-30"/>
        }

        if (sortConfig.direction === 'asc') {
            return <ChevronUp className="h-4 w-4"/>
        }

        if (sortConfig.direction === 'desc') {
            return <ChevronDown className="h-4 w-4"/>
        }

        return <ChevronDown className="h-4 w-4 opacity-30"/>
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount)
    }

    return (
        <Show when={options !== null}
              fallback={options?.length === 0 ?
                  <div>{tr('empty_list')}</div> :
                  <Loader height={32}/>}>
            <div className="flex flex-col w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{tr('title')}</h2>
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-muted hover:bg-muted/80"
                    >
                        <Filter className="h-4 w-4"/>
                        {showFilters ? tr('hide_filters') : tr('show_filters')}
                    </button>
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-muted/30 rounded-md">
                        <div className="flex flex-col gap-1 md:col-span-2">
                            <label className="text-xs font-medium">{t('filter_by_date')}</label>
                            <DateRangePicker
                                startDate={filterConfig.startDate}
                                endDate={filterConfig.endDate}
                                onRangeChangeAction={(startDate, endDate) => {
                                    handleFilterChange('startDate', startDate)
                                    handleFilterChange('endDate', endDate)
                                }}
                                placeholder={t('select_date_range')}
                                className="w-full"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium">{tr('amount')}</label>
                            <input
                                type="text"
                                value={filterConfig.amount}
                                onChange={(e) => handleFilterChange('amount', e.target.value)}
                                placeholder={tr('filter_amount')}
                                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium">{tr('operation')}</label>
                            <input
                                type="text"
                                value={filterConfig.operation}
                                onChange={(e) => handleFilterChange('operation', e.target.value)}
                                placeholder={tr('filter_operation')}
                                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium">{tr('description')}</label>
                            <input
                                type="text"
                                value={filterConfig.description}
                                onChange={(e) => handleFilterChange('description', e.target.value)}
                                placeholder={tr('filter_description')}
                                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium">{tr('filter_reseller')}</label>
                            <select
                                value={filterConfig.reseller === null ? '' : filterConfig.reseller.toString()}
                                onChange={(e) => {
                                    const value = e.target.value
                                    handleFilterChange('reseller', value === '' ? null : value === 'true')
                                }}
                                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">{tr('all')}</option>
                                <option value="true">{tr('yes')}</option>
                                <option value="false">{tr('no')}</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={() => setFilterConfig({
                                    startDate: null,
                                    endDate: null,
                                    amount: '',
                                    operation: '',
                                    description: '',
                                    reseller: null
                                })}
                                className="px-3 py-2 text-sm rounded-md bg-muted hover:bg-muted/80"
                            >
                                {tr('clear_filters')}
                            </button>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                        <tr className="bg-muted/50 dark:bg-muted/40">
                            <th className="p-3 text-left font-medium text-sm">
                                <button
                                    type="button"
                                    onClick={() => handleSort('datetime')}
                                    className="flex items-center gap-1 hover:text-primary"
                                >
                                    {tr('date_time')}
                                    {renderSortIcon('datetime')}
                                </button>
                            </th>
                            <th className="p-3 text-left font-medium text-sm">
                                <button
                                    type="button"
                                    onClick={() => handleSort('amount')}
                                    className="flex items-center gap-1 hover:text-primary"
                                >
                                    {tr('amount')}
                                    {renderSortIcon('amount')}
                                </button>
                            </th>
                            <th className="p-3 text-left font-medium text-sm">
                                <button
                                    type="button"
                                    onClick={() => handleSort('operation')}
                                    className="flex items-center gap-1 hover:text-primary"
                                >
                                    {tr('operation')}
                                    {renderSortIcon('operation')}
                                </button>
                            </th>
                            <th className="p-3 text-left font-medium text-sm">
                                <button
                                    type="button"
                                    onClick={() => handleSort('description')}
                                    className="flex items-center gap-1 hover:text-primary"
                                >
                                    {tr('description')}
                                    {renderSortIcon('description')}
                                </button>
                            </th>
                            <th className="p-3 text-left font-medium text-sm">
                                <button
                                    type="button"
                                    onClick={() => handleSort('reseller')}
                                    className="flex items-center gap-1 hover:text-primary"
                                >
                                    {tr('reseller')}
                                    {renderSortIcon('reseller')}
                                </button>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((transaction, i) => (
                                <tr
                                    key={i}
                                    className={clsx(
                                        'text-sm',
                                        i % 2 !== 0 ? 'bg-muted/30 dark:bg-muted/20' : ''
                                    )}
                                >
                                    <td className="p-3">{moment(transaction.datetime).format('MMM DD, YYYY HH:mm')}</td>
                                    <td className="p-3">{formatCurrency(transaction.amount)}</td>
                                    <td className="p-3">{transaction.operation}</td>
                                    <td className="p-3">{transaction.description}</td>
                                    <td className="p-3">{transaction.reseller ? tr('yes') : tr('no')}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-3 text-center text-sm text-muted-foreground">
                                    {tr('no_transactions')}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-muted-foreground">
                            {tr('showing_results', {
                                start: (currentPage - 1) * ITEMS_PER_PAGE + 1,
                                end: Math.min(currentPage * ITEMS_PER_PAGE, sortedData.length),
                                total: sortedData.length
                            })}
                        </div>
                        <div className="flex gap-1">
                            <button
                                type="button"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={clsx(
                                    'p-2 rounded-md',
                                    currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'
                                )}
                            >
                                <ChevronLeft className="h-4 w-4"/>
                            </button>
                            {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={clsx(
                                        'w-8 h-8 rounded-md text-sm',
                                        currentPage === page ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                                    )}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={clsx(
                                    'p-2 rounded-md',
                                    currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'
                                )}
                            >
                                <ChevronRight className="h-4 w-4"/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Show>
    )
};