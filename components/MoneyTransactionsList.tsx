'use client'
import React from 'react'
import {MoneyTransaction} from '@/types/MoneyTransaction'
import moment from 'moment'
import {Checkbox} from '@/components/ui/checkbox'
import DateRangePicker from '@/components/ui/DateRangePicker'
import {useTranslations} from 'next-intl'
import {Input} from '@/components/ui/input'
import {FormattedDate} from '@/components/ui/formatted-date'
import BooleanDot from '@/components/ui/BooleanDot'
import DataTable, {ColumnDef, FilterDef} from '@/components/ui/DataTable'

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
      cell: (item) => <FormattedDate date={item.datetime.toString()} showTime={true} />,
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
      cell: (item) => <BooleanDot value={item.reseller} />,
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
          onRangeChangeAction={() => {}} // This will be overridden by DataTable
        />
      ),
      applyFilter: (item, filterValue) => {
        if (!filterValue) return true

        // Handle the case when filterValue is an object with start and end dates
        if (typeof filterValue === 'object' && filterValue !== null) {
          const { start, end } = filterValue as { start: Date | null, end: Date | null }
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
        />
      ),
      applyFilter: (item, filterValue) => {
        // When filterValue is true, show only reseller=true records
        // When filterValue is false, show only reseller=false records or null/undefined
        const itemResellerValue = item.reseller === true;

        // Log the filter values to help diagnose the issue
        console.log('Reseller filter:', 'item.reseller =', item.reseller, 'itemResellerValue =', itemResellerValue, 'filterValue =', filterValue);

        // Invert the comparison to match the original behavior
        return itemResellerValue !== filterValue;
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
      loadingFallback={options?.length === 0 ? <div>{tr('empty_list')}</div> : undefined}
    />
  )
}
