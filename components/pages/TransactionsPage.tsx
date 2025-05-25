'use client'
import MoneyTransactionsList from '@/components/MoneyTransactionsList'
import {MoneyTransaction} from '@/types/MoneyTransaction'
import {useEffect, useState} from 'react'
import {useClientStore} from '@/stores/useClientStore'

export default function TransactionsPage() {
    const [localTransactions, setLocalTransactions] = useState<MoneyTransaction[] | null>([])
    const {getTransactions, updateTransactions} = useClientStore()
    const transactions = getTransactions()

    // Set data from store immediately if available
    useEffect(() => {
        if (transactions) {
            console.log('Setting transactions from store:', transactions.length, 'items')
            setLocalTransactions(transactions)
        }
    }, [transactions])

    // Fetch data in the background if not available
    useEffect(() => {
        console.log('Checking if transactions need to be fetched:', !transactions)
        if (!transactions) {
            updateTransactions()
                .then((fetchedTransactions) => {
                    console.log('Fetched transactions:', fetchedTransactions ? fetchedTransactions.length : 0, 'items')
                    setLocalTransactions(fetchedTransactions)
                })
                .catch(error => {
                    console.error('Error fetching transactions:', error)
                })
        }
    }, [transactions, updateTransactions])

    return (
        <MoneyTransactionsList
            options={localTransactions}
        />
    )
}
