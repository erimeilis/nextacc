'use client'
import MoneyTransactionsList from '@/components/MoneyTransactionsList'
import {MoneyTransaction} from '@/types/MoneyTransaction'
import {useEffect, useRef, useState} from 'react'
import {useClientStore} from '@/stores/useClientStore'

export default function TransactionsPage() {
    const [localTransactions, setLocalTransactions] = useState<MoneyTransaction[] | null>(null)
    const {getTransactions, fetchTransactions} = useClientStore()
    const transactions = getTransactions()
    const backgroundFetchDone = useRef(false)

    // Set data from the store immediately if available and fetch in background if needed
    useEffect(() => {
        if (transactions) {
            setLocalTransactions(transactions)
        }

        // Only fetch once when the component mounts
        if (!backgroundFetchDone.current) {
            backgroundFetchDone.current = true
            console.log('TransactionsPage: Fetching transactions in background')
            fetchTransactions()
                .then((fetchedTransactions) => {
                    if (fetchedTransactions) {
                        setLocalTransactions(fetchedTransactions)
                    }
                })
        }
    }, [fetchTransactions, transactions])

    return (
        <MoneyTransactionsList
            options={localTransactions}
        />
    )
}
