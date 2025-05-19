'use client'
import MoneyTransactionsList from '@/components/MoneyTransactionsList'
import {MoneyTransaction} from '@/types/MoneyTransaction'
import {useEffect, useState} from 'react'
import {useClientStore} from '@/stores/useClientStore'

export default function TransactionsPage() {
    const [localTransactions, setLocalTransactions] = useState<MoneyTransaction[] | null>(null)
    const {transactions, updateTransactions} = useClientStore()
    useEffect(() => {
        if (!transactions) {
            updateTransactions()
                .then(() => setLocalTransactions(transactions))
        } else
            setLocalTransactions(transactions)
    }, [transactions, updateTransactions])

    return (
        <MoneyTransactionsList
            options={localTransactions}
        />
    )
}