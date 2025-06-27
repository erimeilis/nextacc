import { CallDestinationInfo } from './CallDestinationInfo'
import { SmsDestinationInfo } from './SmsDestinationInfo'

export type NumberInfo = {
    did: string
    name: string
    where_did?: string
    setup_rate: number
    fix_rate: number
    voice: boolean
    sms: boolean
    toll_free: boolean
    incoming_per_minute?: number
    toll_free_rate_in_min?: number
    incoming_rate_sms?: number
    //docs: Record<string, number>
    docs_personal: string[]
    docs_business: string[]
    creation_date?: string
    paid_till?: string
    months_paid?: number
    voiceDest?: string
    voiceExt?: CallDestinationInfo
    smsDest?: SmsDestinationInfo
    autorenew: boolean
}
