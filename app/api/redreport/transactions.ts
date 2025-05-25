'use server'
import {MoneyTransaction} from '@/types/MoneyTransaction'
import {auth} from '@/auth'
import moment from 'moment'

export async function redGetMoneyTransactionReport(): Promise<MoneyTransaction[] | null> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') {
        console.log('redGetMoneyTransactionReport: No session or anonymous user')
        return null
    }

    const url = new URL(process.env.REDREPORT_URL + '/api/kc/transactions')
    url.searchParams.append('site_id', process.env.SITE_ID || '')
    url.searchParams.append('from', moment().subtract(360, 'days').toISOString())
    url.searchParams.append('to', moment().toISOString())

    console.log('redGetMoneyTransactionReport: Fetching from URL:', url.toString())

    const options: RequestInit = {
        cache: 'reload',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + session?.token,
        }
    }
    return fetch(url.toString(), options)
        .then((res: Response) => {
            console.log('redGetMoneyTransactionReport: Response status:', res.status)
            if (!res.ok) {
                console.log('redGetMoneyTransactionReport: Response not OK')
                return null
            }
            return res.json()
        })
        .then(async (data) => {
            //await slack(JSON.stringify(data.data.money_transactions))
            if (!data || !data.data || !data.data.money_transactions) {
                console.log('redGetMoneyTransactionReport: No money_transactions in response data')
                return null
            }

            console.log('redGetMoneyTransactionReport: Got', data.data.money_transactions.length, 'transactions')

            // Log a sample transaction to see its structure
            if (data.data.money_transactions.length > 0) {
                console.log('redGetMoneyTransactionReport: Sample transaction:', 
                    JSON.stringify(data.data.money_transactions[0]))
            }

            return data.data.money_transactions
        })
        .catch((err) => {
            console.log('redGetMoneyTransactionReport error: ', err.message)
            return null
        })
}
