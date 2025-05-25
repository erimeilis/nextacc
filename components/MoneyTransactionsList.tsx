'use client'
import React, {useEffect, useMemo, useState} from 'react'
import Loader from './service/Loader'
import Show from '@/components/service/Show'
import {MoneyTransaction} from '@/types/MoneyTransaction'
import {FilterConfig, SortConfig, SortDirection} from '@/types/ListFilterTypes'
import moment from 'moment'
import {CaretDown, CaretLeft, CaretRight, CaretUp} from '@phosphor-icons/react'
import {Checkbox} from '@/components/ui/checkbox'
import clsx from 'clsx'
import DateRangePicker from '@/components/ui/DateRangePicker'
import {useTranslations} from 'next-intl'
import {Input} from '@/components/ui/input'
import {FormattedDate} from '@/components/ui/formatted-date'
import BooleanDot from '@/components/ui/BooleanDot'


const ITEMS_PER_PAGE = 10

export default function MoneyTransactionsList({
                                                  options,
                                              }: {
    options: MoneyTransaction[] | null
}) {
    const [sortConfig, setSortConfig] = useState<SortConfig<MoneyTransaction>>({key: null, direction: null})
    const t = useTranslations('daterange')
    const tr = useTranslations('transactions')
    const [filterConfig, setFilterConfig] = useState<FilterConfig>({
        startDate: null,
        endDate: null,
        amount: '',
        operation: '',
        description: '',
        reseller: false
    })
    const [currentPage, setCurrentPage] = useState(1)
    // Filters are always visible now

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
        if (!options) {
            console.log('No options provided to MoneyTransactionsList')
            return []
        }

        if (options.length === 0) {
            console.log('Empty options array provided to MoneyTransactionsList')
            return []
        }

        console.log('Filtering options:', options.length, 'items with config:', filterConfig)

        // Log a sample transaction to help diagnose issues
        if (options.length > 0) {
            console.log('Sample transaction:', JSON.stringify(options[0]))
        }

        return options.filter(item => {
            // Date range filter
            if (filterConfig.startDate) {
                const itemDate = moment(item.datetime).startOf('day')
                const startDate = moment(filterConfig.startDate).startOf('day')
                if (itemDate.isBefore(startDate)) {
                    return false
                }
            }

            if (filterConfig.endDate) {
                const itemDate = moment(item.datetime).startOf('day')
                const endDate = moment(filterConfig.endDate).startOf('day')
                if (itemDate.isAfter(endDate)) {
                    return false
                }
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
            // When filterConfig.reseller is true, show only reseller=true records
            // When filterConfig.reseller is false, show only reseller=false records or null/undefined
            const itemResellerValue = item.reseller === true;

            // Log the reseller values to help diagnose issues
            // console.log('Item reseller:', item.reseller, 'Filter reseller:', filterConfig.reseller, 'Match:', itemResellerValue === filterConfig.reseller);

            // Invert the comparison to fix the reversed behavior
            if (itemResellerValue === filterConfig.reseller) {
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
            return <CaretDown className="h-4 w-4 opacity-30"/>
        }

        if (sortConfig.direction === 'asc') {
            return <CaretUp className="h-4 w-4"/>
        }

        if (sortConfig.direction === 'desc') {
            return <CaretDown className="h-4 w-4"/>
        }

        return <CaretDown className="h-4 w-4 opacity-30"/>
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

                <div className="flex flex-col sm:flex-row items-center p-2 border-b border-border mb-4 gap-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium">{t('filter_by_date')}</label>
                            <div className="relative w-full">
                                <DateRangePicker
                                    startDate={filterConfig.startDate}
                                    endDate={filterConfig.endDate}
                                    onRangeChangeAction={(startDate, endDate) => {
                                        handleFilterChange('startDate', startDate)
                                        handleFilterChange('endDate', endDate)
                                    }}
                                    placeholder={t('select_date_range')}
                                    className="w-full h-8 text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium">{tr('operation')}</label>
                            <div className="relative w-full">
                                <Input
                                    type="text"
                                    value={filterConfig.operation}
                                    onChange={(e) => handleFilterChange('operation', e.target.value)}
                                    placeholder={tr('filter_operation')}
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium">{tr('description')}</label>
                            <div className="relative w-full">
                                <Input
                                    type="text"
                                    value={filterConfig.description}
                                    onChange={(e) => handleFilterChange('description', e.target.value)}
                                    placeholder={tr('filter_description')}
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="reseller-filter"
                            checked={filterConfig.reseller === true}
                            onCheckedChange={(checked) => {
                                // If it was checked and now unchecked, set to false (no)
                                // If it was false and now checked, set to true (yes)
                                handleFilterChange('reseller', checked)
                            }}
                        />
                        <label htmlFor="reseller-filter" className="text-xs font-medium">
                            {tr('filter_reseller')}
                        </label>
                    </div>

                    <button
                        type="button"
                        onClick={() => setFilterConfig({
                            startDate: null,
                            endDate: null,
                            amount: '',
                            operation: '',
                            description: '',
                            reseller: false
                        })}
                        className="px-3 py-1 text-xs rounded-md bg-muted hover:bg-muted/80"
                    >
                        {tr('clear_filters')}
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                        <tr className="bg-muted/50 dark:bg-muted/40">
                            <th className="p-3 text-center font-medium text-sm">
                                <button
                                    type="button"
                                    onClick={() => handleSort('datetime')}
                                    className="flex items-center justify-center gap-1 hover:text-primary mx-auto"
                                >
                                    {tr('date_time')}
                                    {renderSortIcon('datetime')}
                                </button>
                            </th>
                            <th className="p-3 text-center font-medium text-sm">
                                <button
                                    type="button"
                                    onClick={() => handleSort('amount')}
                                    className="flex items-center justify-center gap-1 hover:text-primary mx-auto"
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
                            <th className="p-3 text-center font-medium text-sm">
                                <button
                                    type="button"
                                    onClick={() => handleSort('reseller')}
                                    className="flex items-center justify-center gap-1 hover:text-primary mx-auto"
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
                                    <td className="p-3 text-center"><FormattedDate date={transaction.datetime.toString()} showTime={true}/></td>
                                    <td className="p-3 text-center text-primary font-medium">{formatCurrency(transaction.amount)}</td>
                                    <td className="p-3">{transaction.operation}</td>
                                    <td className="p-3">{transaction.description}</td>
                                    <td className="p-3 text-center"><BooleanDot value={transaction.reseller} /></td>
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
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2 border-t border-border pt-2">
                        <div className="text-xs text-muted-foreground order-2 sm:order-1">
                            {tr('showing_results', {
                                start: (currentPage - 1) * ITEMS_PER_PAGE + 1,
                                end: Math.min(currentPage * ITEMS_PER_PAGE, sortedData.length),
                                total: sortedData.length
                            })}
                        </div>
                        <div className="flex gap-1 order-1 sm:order-2">
                            <button
                                type="button"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={clsx(
                                    'p-1 rounded-md',
                                    currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'
                                )}
                            >
                                <CaretLeft className="h-3 w-3"/>
                            </button>
                            {/* Page numbers with ellipsis for mobile */}
                            {Array.from({length: totalPages}, (_, i) => i + 1)
                                .map(page => {
                                    // Show ellipsis for gaps in pagination on mobile
                                    const showOnMobile =
                                        page === 1 ||
                                        page === totalPages ||
                                        page === currentPage ||
                                        page === currentPage - 1 ||
                                        page === currentPage + 1

                                    // Show ellipsis after page 2 if there's a gap
                                    const showEllipsisAfter =
                                        page === 2 &&
                                        currentPage > 4 &&
                                        totalPages > 5

                                    // Show ellipsis before the last page - 1 if there's a gap
                                    const showEllipsisBefore =
                                        page === totalPages - 2 &&
                                        currentPage < totalPages - 3 &&
                                        totalPages > 5

                                    if (showEllipsisAfter && !showOnMobile) {
                                        return (
                                            <div
                                                key={`ellipsis-after-${page}`}
                                                className="w-6 h-6 flex items-center justify-center text-xs hidden sm:flex"
                                            >
                                                ...
                                            </div>
                                        )
                                    }

                                    if (showEllipsisBefore && !showOnMobile) {
                                        return (
                                            <div
                                                key={`ellipsis-before-${page}`}
                                                className="w-6 h-6 flex items-center justify-center text-xs hidden sm:flex"
                                            >
                                                ...
                                            </div>
                                        )
                                    }

                                    // For mobile, show ellipsis if there's a gap between page 2 and the last page
                                    if (page === 2 && !showOnMobile && totalPages > 3) {
                                        return (
                                            <div
                                                key="ellipsis-mobile"
                                                className="w-6 h-6 flex items-center justify-center text-xs sm:hidden"
                                            >
                                                ...
                                            </div>
                                        )
                                    }

                                    return (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => setCurrentPage(page)}
                                            className={clsx(
                                                'w-6 h-6 rounded-md text-xs',
                                                !showOnMobile ? 'hidden sm:block' : '',
                                                currentPage === page ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                                            )}
                                        >
                                            {page}
                                        </button>
                                    )
                                })
                            }
                            <button
                                type="button"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={clsx(
                                    'p-1 rounded-md',
                                    currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'
                                )}
                            >
                                <CaretRight className="h-3 w-3"/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Show>
    )
};
