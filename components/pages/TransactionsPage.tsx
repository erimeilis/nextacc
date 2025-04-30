'use server'
import {redGetMoneyTransactionReport} from '@/app/api/redreport/transactions'
import MoneyTransactionsList from '@/components/MoneyTransactionsList'
import {MoneyTransaction} from '@/types/MoneyTransaction'

export default async function TransactionsPage() {
    const report: MoneyTransaction[] = await redGetMoneyTransactionReport()

    return (
        <MoneyTransactionsList
            options={report}
        />
    )
}