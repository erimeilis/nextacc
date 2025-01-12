'use server'
import {MoneyTransaction} from '@/types/MoneyTransaction'
import {auth} from '@/auth'

export async function redGetMoneyTransactionReport(): Promise<MoneyTransaction[]> {
    const session = await auth()
    const options: RequestInit = {
        cache: 'no-store',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + session?.token
        },
        body: JSON.stringify({
            'site': process.env.SITE_ID,
            //'from': moment().subtract(30, 'days'),
            //'to': moment(),
        })
    }
    return fetch(process.env.REDREPORT_URL + '/api/kc/transactions', options)
        .then((res: Response) => {
            console.log('redGetMoneyTransactionReport: ', res.status)
            if (!res.ok) return []
            return res.json()
        })
        .then(async (data) => {
            //await slack(JSON.stringify(data.data.money_transactions))
            return data.data.money_transactions
        })
        .catch((err) => {
            console.log('redGetMoneyTransactionReport error: ', err.message)
            return []
        })
}