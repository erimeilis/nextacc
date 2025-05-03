'use server'
import {MoneyTransaction} from '@/types/MoneyTransaction'
import {auth} from '@/auth'
import moment from 'moment'
import {getClientIp} from '@/utils/getClientIp'

export async function redGetCallStatisticsReport(): Promise<MoneyTransaction[]> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') return []

    // Create URL with query parameters instead of using body
    const url = new URL(process.env.REDREPORT_URL + '/api/kc/calls');
    url.searchParams.append('site', process.env.SITE_ID || '');
    url.searchParams.append('from', moment().subtract(360, 'days').toISOString());
    url.searchParams.append('to', moment().toISOString());

    const clientIp = await getClientIp()
    const options: RequestInit = {
        cache: 'no-store',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + session?.token,
            'X-Client-IP': clientIp || ''
        }
        // Removed body as GET requests cannot have bodies
    }

    return fetch(url.toString(), options)
        .then((res: Response) => {
            //console.log('redGetMoneyTransactionReport: ', res.status)
            if (!res.ok) return []
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
