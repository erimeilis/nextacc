'use client'
import MoneyTransactionsList from '@/components/MoneyTransactionsList'
import {MoneyTransaction} from '@/types/MoneyTransaction'
import {useEffect, useState} from 'react'
import {useClientStore} from '@/stores/useClientStore'

export default function TransactionsPage() {
    const [localTransactions, setLocalTransactions] = useState<MoneyTransaction[] | null>(null)
    const {transactions, updateTransactions} = useClientStore()
    useEffect(() => {
        if (transactions) {
            setLocalTransactions(transactions)
        } else {
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