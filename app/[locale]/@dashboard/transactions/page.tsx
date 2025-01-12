'use server'
import {redGetMoneyTransactionReport} from '@/app/api/redreport/transactions'
import MoneyTransactionsList from '@/components/MoneyTransactionsList' // Assuming that it's imported correctly

export default async function Page() {
    const report = await redGetMoneyTransactionReport()

    return (
        <MoneyTransactionsList
            options={report}
        />
    )
}