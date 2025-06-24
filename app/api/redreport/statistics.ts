'use server'
import { auth } from '@/auth'
import moment from 'moment'
import { CallStatistics, SmsStatistics } from '@/types/Statistics'

// Function to get call statistics
export async function getCallStatistics(from?: string, to?: string, did?: string): Promise<CallStatistics[]> {
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
        .then((res: Response) => {
            if (!res.ok) return []
            return res.json()
        })
        .then(data => {
            return data.data || []
        })
        .catch(err => {
            console.error('getCallStatistics error:', err.message)
            return []
        })
}

// Function to send call statistics to email
export async function sendCallStatistics(from?: string, to?: string, did?: string): Promise<boolean> {
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
        .then((res: Response) => {
            return res.ok
        })
        .catch(err => {
            console.error('sendCallStatistics error:', err.message)
            return false
        })
}

// Function to get SMS statistics
export async function getSmsStatistics(from?: string, to?: string, did?: string): Promise<SmsStatistics[]> {
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
        .then((res: Response) => {
            if (!res.ok) return []
            return res.json()
        })
        .then(data => {
            return data.data || []
        })
        .catch(err => {
            console.error('getSmsStatistics error:', err.message)
            return []
        })
}

// Function to send SMS statistics to email
export async function sendSmsStatistics(from?: string, to?: string, did?: string): Promise<boolean> {
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
        .then((res: Response) => {
            return res.ok
        })
        .catch(err => {
            console.error('sendSmsStatistics error:', err.message)
            return false
        })
}
