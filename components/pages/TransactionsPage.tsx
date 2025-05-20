'use client'
import MoneyTransactionsList from '@/components/MoneyTransactionsList'
import {MoneyTransaction} from '@/types/MoneyTransaction'
import {useEffect, useState} from 'react'
import {useClientStore} from '@/stores/useClientStore'

export default function TransactionsPage() {
    const [localTransactions, setLocalTransactions] = useState<MoneyTransaction[] | null>([])
    const {transactions, updateTransactions} = useClientStore()

    // Set data from store immediately if available
    useEffect(() => {
        if (transactions) {
            setLocalTransactions(transactions)
        }
    }, [transactions])

    // Fetch data in the background if not available
    useEffect(() => {
        if (!transactions) {
            updateTransactions()
                .then((fetchedTransactions) => {
                    setLocalTransactions(fetchedTransactions)
                })
        }
    }, [transactions, updateTransactions])

    return (
        <MoneyTransactionsList
            options={localTransactions}
        />
    )
}
