'use client'
import MoneyTransactionsList from '@/components/MoneyTransactionsList'
import {MoneyTransaction} from '@/types/MoneyTransaction'
import {useEffect, useRef, useState} from 'react'
import {useClientStore} from '@/stores/useClientStore'

export default function TransactionsPage() {
    const [localTransactions, setLocalTransactions] = useState<MoneyTransaction[] | null>([])
    const {getTransactions, updateTransactions} = useClientStore()
    const transactions = getTransactions()
    const backgroundFetchDone = useRef(false)

    // Set data from the store immediately if available
    useEffect(() => {
        if (transactions) {
            setLocalTransactions(transactions)
        }
    }, [transactions, updateTransactions])

    // Fetch data in the background if not available
    useEffect(() => {
        if (!transactions) {
            updateTransactions()
                .then((fetchedTransactions) => {
                    setLocalTransactions(fetchedTransactions)
                })
        }
    }, [transactions, updateTransactions])

    // Fetch data in the background even when it exists, but only once per-page visit
    useEffect(() => {
        if (transactions && !backgroundFetchDone.current) {
            backgroundFetchDone.current = true
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
