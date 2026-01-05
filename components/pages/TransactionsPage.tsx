'use client'

import MoneyTransactionsList from '@/components/MoneyTransactionsList'
import { useTransactions } from '@/hooks/queries/use-transactions'

export default function TransactionsPage() {
    const { data: transactions, isLoading, error } = useTransactions()

    // MoneyTransactionsList handles null with its own skeleton
    // Pass null while loading to show skeleton, or error state
    if (error) {
        return (
            <div className="text-center py-8 text-destructive">
                <p>Failed to load transactions: {error.message}</p>
            </div>
        )
    }

    return (
        <MoneyTransactionsList
            options={isLoading ? null : (transactions ?? null)}
        />
    )
}
