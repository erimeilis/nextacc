export type MyWaitingNumberInfo = {
    did: string
    setup_rate: number
    fix_rate: number
    pay_sum: number
    count_month: number
    voiceDestType: string
    voiceDest: string
    smsDesType: string
    smsDest: string
    docs: string[]
    voice: boolean
    sms: boolean
    toll_free: boolean
    country_id?: number
}
