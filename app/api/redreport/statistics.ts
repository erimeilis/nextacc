'use server'
import {auth} from '@/auth'
import moment from 'moment'
import {CallStatistics, SmsStatistics} from '@/types/Statistics'

// Function to get call statistics
export async function redGetCallStatistics(from?: string, to?: string, did?: string): Promise<CallStatistics[]> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') return []

    // Create URL with query parameters
    const url = new URL(process.env.REDREPORT_URL + '/api/kc/calls')
    url.searchParams.append('site_id', process.env.SITE_ID || '')
    url.searchParams.append('from', from || moment().subtract(30, 'days').toISOString())
    url.searchParams.append('to', to || moment().toISOString())
    if (did) url.searchParams.append('did', did)

    const options: RequestInit = {
        cache: 'no-store',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + session?.token,
        }
    }

    return fetch(url.toString(), options)
        .then(async (res: Response) => {
            console.log('redGetCallStatistics: ', res.status)
            if (!res.ok) {
                const errorData = await res.json()
                console.log('redGetCallStatistics error response: ', errorData)
                return []
            }
            return res.json()
        })
        .then(data => {
            return data.data || []
        })
        .catch(err => {
            console.error('redGetCallStatistics error:', err.message)
            return []
        })
}

// Function to send call statistics to email
export async function redSendCallStatistics(from?: string, to?: string, did?: string): Promise<boolean> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') return false

    // Create URL with query parameters
    const url = new URL(process.env.REDREPORT_URL + '/api/kc/calls/send')
    url.searchParams.append('site_id', process.env.SITE_ID || '')
    url.searchParams.append('from', from || moment().subtract(30, 'days').toISOString())
    url.searchParams.append('to', to || moment().toISOString())
    if (did) url.searchParams.append('did', did)

    const options: RequestInit = {
        cache: 'no-store',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + session?.token,
        }
    }

    return fetch(url.toString(), options)
        .then(async (res: Response) => {
            console.log('redSendCallStatistics: ', res.status)
            if (!res.ok) {
                const errorData = await res.json()
                console.log('redSendCallStatistics error response: ', errorData)
                return false
            }
            return true
        })
        .catch(err => {
            console.error('redSendCallStatistics error:', err.message)
            return false
        })
}

// Function to get SMS statistics
export async function redGetSmsStatistics(from?: string, to?: string, did?: string): Promise<SmsStatistics[]> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') return []

    // Create URL with query parameters
    const url = new URL(process.env.REDREPORT_URL + '/api/kc/sms')
    url.searchParams.append('site_id', process.env.SITE_ID || '')
    url.searchParams.append('from', from || moment().subtract(30, 'days').toISOString())
    url.searchParams.append('to', to || moment().toISOString())
    if (did) url.searchParams.append('did', did)

    const options: RequestInit = {
        cache: 'no-store',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + session?.token,
        }
    }

    return fetch(url.toString(), options)
        .then(async (res: Response) => {
            console.log('redGetSmsStatistics: ', res.status)
            if (!res.ok) {
                const errorData = await res.json()
                console.log('redGetSmsStatistics error response: ', errorData)
                return []
            }
            return res.json()
        })
        .then(data => {
            return data.data || []
        })
        .catch(err => {
            console.error('redGetSmsStatistics error:', err.message)
            return []
        })
}

// Function to send SMS statistics to email
export async function redSendSmsStatistics(from?: string, to?: string, did?: string): Promise<boolean> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') return false

    // Create URL with query parameters
    const url = new URL(process.env.REDREPORT_URL + '/api/kc/sms/send')
    url.searchParams.append('site_id', process.env.SITE_ID || '')
    url.searchParams.append('from', from || moment().subtract(30, 'days').toISOString())
    url.searchParams.append('to', to || moment().toISOString())
    if (did) url.searchParams.append('did', did)

    const options: RequestInit = {
        cache: 'no-store',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + session?.token,
        }
    }

    return fetch(url.toString(), options)
        .then(async (res: Response) => {
            console.log('redSendSmsStatistics: ', res.status)
            if (!res.ok) {
                const errorData = await res.json()
                console.log('redSendSmsStatistics error response: ', errorData)
                return false
            }
            return true
        })
        .catch(err => {
            console.error('redSendSmsStatistics error:', err.message)
            return false
        })
}
