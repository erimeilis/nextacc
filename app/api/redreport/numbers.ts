'use server'
import {auth} from '@/auth'
import {NumberInfo} from '@/types/NumberInfo'

export async function redGetMyNumbers(): Promise<NumberInfo[]> {
    const session = await auth()
    if (!session) return []
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
        })
    }
    return fetch(process.env.REDREPORT_URL + '/api/kc/numbers', options)
        .then((res: Response) => {
            //console.log('redGetMyNumbers: ', res.status)
            if (!res.ok) return []
            return res.json()
        })
        .then(async (data) => {
            return data.data
        })
        .catch((err) => {
            console.log('redGetMyNumbers error: ', err.message)
            return []
        })
}