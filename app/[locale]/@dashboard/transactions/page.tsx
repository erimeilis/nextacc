'use server'
import {redGetMoneyTransactionReport} from '@/app/api/redreport/transactions'
import MoneyTransactionsList from '@/components/MoneyTransactionsList'
import {MoneyTransaction} from '@/types/MoneyTransaction' // Assuming that it's imported correctly

export default async function Page() {
    const report: MoneyTransaction[] = await redGetMoneyTransactionReport()

    return (
        <MoneyTransactionsList
            options={report}
        />
    )
}