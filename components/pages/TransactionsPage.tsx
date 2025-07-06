'use client'
import MoneyTransactionsList from '@/components/MoneyTransactionsList'
import {MoneyTransaction} from '@/types/MoneyTransaction'
import {useEffect, useRef, useState} from 'react'
import {useClientStore} from '@/stores/useClientStore'

export default function TransactionsPage() {
    const [localTransactions, setLocalTransactions] = useState<MoneyTransaction[] | null>([])
    const {getTransactions, fetchTransactions} = useClientStore()
    const transactions = getTransactions()
    const backgroundFetchDone = useRef(false)

    // Set data from the store immediately if available and fetch in background if needed
    useEffect(() => {
        if (transactions) {
            setLocalTransactions(transactions)
        }
        if (!transactions || !backgroundFetchDone.current) {
            backgroundFetchDone.current = true
            fetchTransactions()
                .then((fetchedTransactions) => {
                    setLocalTransactions(fetchedTransactions)
                })
        }
    }, [transactions, fetchTransactions])

    return (
        <MoneyTransactionsList
            options={localTransactions}
        />
    )
}
