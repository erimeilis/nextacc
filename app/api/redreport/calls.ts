'use server'
import {MoneyTransaction} from '@/types/MoneyTransaction'
import {auth} from '@/auth'
import moment from 'moment'

export async function redGetCallStatisticsReport(): Promise<MoneyTransaction[]> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') return []

    // Create URL with query parameters instead of using body
    const url = new URL(process.env.REDREPORT_URL + '/api/kc/calls')
    url.searchParams.append('site_id', process.env.SITE_ID || '')
    url.searchParams.append('from', moment().subtract(360, 'days').toISOString())
    url.searchParams.append('to', moment().toISOString())

    const options: RequestInit = {
        cache: 'no-store',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + session?.token,
        }
        // Removed body as GET requests cannot have bodies
    }

    return fetch(url.toString(), options)
        .then(async (res: Response) => {
            //console.log('redGetMoneyTransactionReport: ', res.status)
            if (!res.ok) {
                const errorData = await res.json()
                console.log('redGetCallStatisticsReport error response: ', errorData)
                return []
            }
            return res.json()
        })
        .then(async (data) => {
            //await slack(JSON.stringify(data.data.money_transactions))
            return data.data
        })
        .catch((err) => {
            console.log('redGetCallStatisticsReport error: ', err.message)
            return []
        })
}
