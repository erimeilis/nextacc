import {NumberDestination} from '@/types/NumberDestination'

export type CartItem = {
    id: number,
    did: string,
    where_did: string,
    count_month: number,
    sum: number,
    date: string,
    voice?: NumberDestination,
    sms?: NumberDestination
}