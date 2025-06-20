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
    url.searchParams.append('from', moment().subtract(360, 'days').format('YYYY-MM-DD'))
    url.searchParams.append('to', moment().format('YYYY-MM-DD'))

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

            return data.data.money_transactions
        })
        .catch((err) => {
            console.log('redGetMoneyTransactionReport error: ', err.message)
            return null
        })
}
