import {NumberDestination} from '@/types/NumberDestination'
import {NumberInfo} from '@/types/NumberInfo'

// Omit the specified properties from NumberInfo for the did_info property
type ModifiedNumberInfo = Omit<NumberInfo, 'did' | 'name' | 'where_did'>

export type CartItem = {
    id: number,
    did: string,
    where_did: string,
    count_month: number,
    sum: number,
    date: string,
    voice?: NumberDestination,
    sms?: NumberDestination,
    did_info?: ModifiedNumberInfo
}