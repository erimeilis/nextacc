'use server'
import {auth} from '@/auth'
import {NumberInfo} from '@/types/NumberInfo'

export async function redGetMyNumbers(): Promise<NumberInfo[]> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') return []

    const url = new URL(process.env.REDREPORT_URL + '/api/kc/numbers')
    url.searchParams.append('site', process.env.SITE_ID || '')

    const options: RequestInit = {
        cache: 'reload',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + session?.token,
        }
        // Removed body as GET requests cannot have bodies
    }

    return fetch(url.toString(), options)
        .then((res: Response) => {
            //console.log('redGetMyNumbers: ', res.status)
            if (!res.ok) return []
            return res.json()
        })
        .then(async (data) => {
            return data.data.dids || []
        })
        .catch((err) => {
            console.log('redGetMyNumbers error: ', err.message)
            return []
        })
}