'use server'
import {auth} from '@/auth'
import {NumberInfo} from '@/types/NumberInfo'
import {getCart} from '@/app/api/redreport/buy'
import {getPersistState} from '@/usePersistState'

export async function redGetMyNumbers(): Promise<NumberInfo[]> {
    const persistentId = getPersistState<string>('persistentId', 'no-id')
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
            // Get all numbers
            const allNumbers = data.data.dids || []

            // Find cart numbers to exclude todo check if it really works
            let cartItems = []
            try {
                cartItems = await getCart({uid: persistentId})
            } catch (error) {
                console.log('Error fetching cart items:', error)
            }

            // Get cart DIDs to exclude
            const cartDids = cartItems.map((item: { did: never }) => item.did || '')

            // Filter for digit-only numbers that are not in the cart
            return allNumbers.filter((number: { did: string }) => {
                // Check if it's digit-only (contains only 0-9)
                const isDigitsOnly = /^\d+$/.test(number.did)
                // Check if it's not in the cart
                const isNotInCart = !cartDids.includes(number.did)
                return isDigitsOnly && isNotInCart
            })
        })
        .catch((err) => {
            console.log('redGetMyNumbers error: ', err.message)
            return []
        })
}