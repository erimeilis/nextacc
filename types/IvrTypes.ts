export type FileLink = {
    id: number
    original_name: string
    url: string
}

export type Ivr = {
    id: number
    name: string
    description: string
    lang: string
    client_lang: string
    price: number
    multiplier: number
    music_inc: number
    file: number
    gender: string
    price_add: number | null
    filelink: FileLink
}

export type IvrMusic = {
    id: number
    name: string
    description: string | null
    filelink: FileLink
}

export type IvrEffect = {
    id: number
    name: string
    description: string | null
    filelink: FileLink
}

export type IvrOrder = {
    client_id: string
    amount: string
    duration: string
    ivr_id: string
    ivr_music_id?: string
    ivr_effect_id?: string
    text: string
    comment?: string
    paid: boolean
    created_at?: string
}

export type IvrOrdersResponse = {
    orders: IvrOrder[]
}

export type OrderIvrParams = {
    ivr: string
    ivr_music?: string
    ivr_effect?: string
    amount: string
    duration: string
    text: string
    comment?: string
}

export type OrderIvrResponse = {
    code: number
    message: string
}

export type IvrResponse = {
    data: {
        ivr: Ivr[]
        ivrmusic: IvrMusic[]
        ivreffects: IvrEffect[]
    }
    message: string
}
