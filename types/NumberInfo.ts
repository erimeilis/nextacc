export type NumberInfo = {
    did: string
    name: string
    where_did: string
    setup_rate: number
    fix_rate: number
    voice: boolean
    sms: boolean
    toll_free: boolean
    incoming_per_minute?: number
    toll_free_rate_in_min?: number
    incoming_rate_sms?: number
    docs: string
}