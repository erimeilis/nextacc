'use client'
import React, {useEffect, useMemo, useState} from 'react'
import Loader from '../service/Loader'
import Show from '@/components/service/Show'
import {CaretDownIcon, CaretLeftIcon, CaretRightIcon, CaretUpIcon} from '@phosphor-icons/react'
import clsx from 'clsx'
import {Checkbox} from '@/components/ui/Checkbox'
import {useTranslations} from 'next-intl'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/Table'

// Generic types for the DataTable component
export type SortDirection = 'asc' | 'desc' | null

export type SortConfig<T> = {
    key: keyof T | null
    direction: SortDirection
}

export type ColumnDef<T> = {
    key: keyof T
    header: string | React.ReactNode
    cell: (item: T) => React.ReactNode
    sortable?: boolean
    align?: 'left' | 'center' | 'right'
}

export type FilterDef<T, F> = {
    key: keyof F
    label: string
    component: React.ReactNode
    applyFilter: (item: T, filterValue: unknown) => boolean
    renderWithClearButton?: boolean
}

export type PaginationOptions = {
    itemsPerPage?: number
    showPageNumbers?: boolean
    showItemCounts?: boolean
    itemsPerPageOptions?: number[]
}

export type DataTableProps<T, F> = {
    data: T[] | null
    columns: ColumnDef<T>[]
    filters?: FilterDef<T, F>[]
    initialFilterValues?: F
    initialSort?: SortConfig<T>
    pagination?: PaginationOptions
    emptyMessage?: string
    loadingFallback?: React.ReactNode
    className?: string
    onRowClick?: (item: T) => void
    rowClassName?: (item: T) => string
    textSize?: 'text-xs' | 'text-sm' | 'text-base'
}

const DEFAULT_ITEMS_PER_PAGE = 10

// Add this type definition near the top of your file with the other type definitions
type FilterComponentProps = {
    value?: unknown;
    onChange?: (value: unknown) => void;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    onRangeChangeAction?: (start: Date | null, end: Date | null) => void;
}

export default function DataTable<T extends object, F extends Record<string, unknown> = Record<string, never>>(
    props: DataTableProps<T, F>
) {
    const tr = useTranslations('transactions')

    const {
        data,
        columns,
        filters = [],
        initialFilterValues,
        initialSort = {key: null, direction: null},
        pagination = {
            itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
            showPageNumbers: true,
            showItemCounts: true,
        },
        emptyMessage = 'No data available',
        loadingFallback = <Loader height={32}/>,
        className = '',
        onRowClick,
        rowClassName,
        textSize = 'text-xs',
    } = props

    const [sortConfig, setSortConfig] = useState<SortConfig<T>>(initialSort)
    const [filterValues, setFilterValues] = useState<F>(initialFilterValues || {} as F)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = pagination.itemsPerPage || DEFAULT_ITEMS_PER_PAGE

    // Reset to the first page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [filterValues])

    const handleSort = (key: keyof T) => {
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

    const handleFilterChange = (key: keyof F, value: unknown) => {
        // Log the current filter values and the new value being set
        console.log('Current filter values:', filterValues, 'Setting', key, 'to', value)

        setFilterValues(prev => {
            const newValues = {
                ...prev,
                [key]: value
            }
            console.log('New filter values:', newValues)
            return newValues
        })
    }

    const filteredData = useMemo(() => {
        if (!data) {
            return []
        }

        if (data.length === 0 || Object.keys(filterValues).length === 0) {
            return data
        }

        return data.filter(item => {
            // Apply all filters
            return filters.every(filter => {
                const filterValue = filterValues[filter.key]

                // Skip filtering if the filter value is empty/null/undefined
                if (filterValue === undefined || filterValue === null ||
                    (typeof filterValue === 'string' && filterValue === '') ||
                    (Array.isArray(filterValue) && filterValue.length === 0)) {
                    return true
                }

                return filter.applyFilter(item, filterValue)
            })
        })
    }, [data, filterValues, filters])

    const sortedData = useMemo(() => {
        if (!sortConfig.key || sortConfig.direction === null) return filteredData

        return [...filteredData].sort((a, b) => {
            if (sortConfig.key === null) return 0

            const aValue = a[sortConfig.key]
            const bValue = b[sortConfig.key]

            // Handle different data types
            if (aValue instanceof Date && bValue instanceof Date) {
                return sortConfig.direction === 'asc'
                    ? aValue.getTime() - bValue.getTime()
                    : bValue.getTime() - aValue.getTime()
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
            }

            // Convert to string for comparison
            const aString = String(aValue).toLowerCase()
            const bString = String(bValue).toLowerCase()

            if (aString < bString) {
                return sortConfig.direction === 'asc' ? -1 : 1
            }
            if (aString > bString) {
                return sortConfig.direction === 'asc' ? 1 : -1
            }
            return 0
        })
    }, [filteredData, sortConfig])

    // Pagination
    const totalPages = Math.ceil(sortedData.length / itemsPerPage)
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const renderSortIcon = (key: keyof T, sortable: boolean = true) => {
        if (!sortable) return null

        if (sortConfig.key !== key) {
            return <CaretDownIcon className="h-4 w-4 opacity-30"/>
        }

        if (sortConfig.direction === 'asc') {
            return <CaretUpIcon className="h-4 w-4"/>
        }

        if (sortConfig.direction === 'desc') {
            return <CaretDownIcon className="h-4 w-4"/>
        }

        return <CaretDownIcon className="h-4 w-4 opacity-30"/>
    }

    return (
        <Show when={data !== null} fallback={loadingFallback}>
            <div className={`flex flex-col w-full ${className}`}>
                {/* Filters section */}
                {filters.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center p-2 gap-2">
                        <div className="flex flex-wrap gap-2 w-full">
                            {filters.filter(filter => !filter.renderWithClearButton).map((filter, index) => (
                                <div key={index} className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                    <label className="text-xs font-medium">{filter.label}</label>
                                    <div className="relative w-full">
                                        {React.cloneElement(filter.component as React.ReactElement<FilterComponentProps>, {
                                            value: filterValues[filter.key],
                                            onChange: (e: React.ChangeEvent<HTMLInputElement> | unknown) => {
                                                // Handle different types of inputs
                                                const value = e && typeof e === 'object' && 'target' in e && (e as { target: unknown }).target && 'value' in ((e as {
                                                    target: unknown
                                                }).target as object)
                                                    ? ((e as { target: { value: unknown } }).target.value)
                                                    : e
                                                handleFilterChange(filter.key, value)
                                            },
                                            // Only add onCheckedChange to Checkbox components
                                            ...((filter.component && React.isValidElement(filter.component) && filter.component.type === Checkbox) ? {
                                                checked: !!filterValues[filter.key],
                                                onCheckedChange: (checked: boolean) => {
                                                    console.log('Checkbox onCheckedChange called with:', checked)
                                                    handleFilterChange(filter.key, checked)
                                                }
                                            } : {}),
                                            // Only add onRangeChangeAction to DateRangePicker components
                                            // Check if the component has onRangeChangeAction prop
                                            ...(filter.component && typeof filter.component === 'object' && 'props' in filter.component && filter.component.props && typeof filter.component.props === 'object' && 'onRangeChangeAction' in filter.component.props ? {
                                                onRangeChangeAction: (start: Date | null, end: Date | null) => {
                                                    // For date range pickers
                                                    handleFilterChange(filter.key, {start, end})
                                                }
                                            } : {})
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Clear filters button and special filters */}
                {filters.length > 0 && (
                    <div className="flex justify-between items-center p-2 border-b border-border mb-4">
                        <div className="flex items-center gap-4">
                            {filters.filter(filter => filter.renderWithClearButton).map((filter, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <label className="text-xs font-medium">{filter.label}</label>
                                    <div className="relative">
                                        {React.cloneElement(filter.component as React.ReactElement<FilterComponentProps>, {
                                            value: filterValues[filter.key],
                                            onChange: (e: React.ChangeEvent<HTMLInputElement> | unknown) => {
                                                // Handle different types of inputs
                                                const value = e && typeof e === 'object' && 'target' in e && e.target && typeof e.target === 'object' && 'value' in e.target
                                                    ? e.target.value
                                                    : e
                                                handleFilterChange(filter.key, value)
                                            },
                                            // Only add onCheckedChange to Checkbox components
                                            ...(React.isValidElement(filter.component) && filter.component.type === Checkbox ? {
                                                checked: !!filterValues[filter.key],
                                                onCheckedChange: (checked: boolean) => {
                                                    console.log('Checkbox onCheckedChange called with:', checked)
                                                    handleFilterChange(filter.key, checked)
                                                }
                                            } : {}),
                                            // Only add onRangeChangeAction to DateRangePicker components
                                            // Check if the component has onRangeChangeAction prop
                                            ...(filter.component && typeof filter.component === 'object' && 'props' in filter.component && filter.component.props && typeof filter.component.props === 'object' && 'onRangeChangeAction' in filter.component.props ? {
                                                onRangeChangeAction: (start: Date | null, end: Date | null) => {
                                                    // For date range pickers
                                                    handleFilterChange(filter.key, {start, end})
                                                }
                                            } : {})
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => setFilterValues({} as F)}
                            className="px-3 py-1 text-xs rounded-md bg-muted hover:bg-muted/80"
                        >
                            {tr('clear_filters')}
                        </button>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table striped className={`[&_td]:p-3 [&_th]:p-3 [&_td]:${textSize} [&_th]:${textSize}`}>
                        <TableHeader>
                            <TableRow className="bg-muted/50 dark:bg-muted/40 hover:bg-muted/50 dark:hover:bg-muted/40">
                                {columns.map((column, index) => (
                                    <TableHead
                                        key={index}
                                        className={`text-${column.align || 'left'} font-medium`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => column.sortable !== false && handleSort(column.key)}
                                            className={clsx(
                                                'flex items-center gap-1',
                                                column.align === 'center' && 'justify-center mx-auto',
                                                column.align === 'right' && 'justify-end ml-auto',
                                                column.sortable !== false && 'hover:text-primary'
                                            )}
                                            disabled={column.sortable === false}
                                        >
                                            {column.header}
                                            {renderSortIcon(column.key, column.sortable)}
                                        </button>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item, i) => (
                                <TableRow
                                    key={i}
                                    className={clsx(
                                        onRowClick && 'cursor-pointer',
                                        rowClassName && rowClassName(item)
                                    )}
                                    onClick={() => onRowClick && onRowClick(item)}
                                >
                                    {columns.map((column, j) => (
                                        <TableCell
                                            key={j}
                                            className={`${column.align === 'center' ? 'text-center' : ''} ${column.align === 'right' ? 'text-right' : ''}`}
                                        >
                                            {column.cell(item)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2 border-t border-border pt-2">
                        {pagination.showItemCounts && (
                            <div className="text-xs text-muted-foreground order-2 sm:order-1">
                                {tr('showing_results', {
                                    start: (currentPage - 1) * itemsPerPage + 1,
                                    end: Math.min(currentPage * itemsPerPage, sortedData.length),
                                    total: sortedData.length
                                })}
                            </div>
                        )}
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
                                <CaretLeftIcon className="h-3 w-3"/>
                            </button>

                            {pagination.showPageNumbers && Array.from({length: totalPages}, (_, i) => i + 1)
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
                                <CaretRightIcon className="h-3 w-3"/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Show>
    )
}
