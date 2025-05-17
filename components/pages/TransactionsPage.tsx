'use client'
import MoneyTransactionsList from '@/components/MoneyTransactionsList'
import {MoneyTransaction} from '@/types/MoneyTransaction'
import {useEffect, useState} from 'react'
import {useClientStore} from '@/stores/useClientStore'

export default function TransactionsPage() {
    const [transactionsState, setTransactionsState] = useState<MoneyTransaction[] | null>(null)
    const {transactions, updateTransactions} = useClientStore()
    useEffect(() => {
        if (!transactions) {
            updateTransactions()
        }
    }, [transactions, updateTransactions])

    useEffect(() => {
        setTransactionsState(transactions)
    }, [transactions])

    return (
        <MoneyTransactionsList
            options={transactionsState}
        />
    )
}