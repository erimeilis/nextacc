export type MyWaitingNumberInfo = {
    id: string
    did: string
    setup_rate: number
    fix_rate: number
    pay_sum: number
    count_month: number
    voiceDestType: string
    voiceDest: string
    smsDestType: string
    smsDest: string
    docs: (string | { type: string; file: string })[]
    voice: boolean
    sms: boolean
    toll_free: boolean
    country_id?: number
}
