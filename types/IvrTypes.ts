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

export type IvrResponse = {
    data: {
        ivr: Ivr[]
        ivrmusic: IvrMusic[]
        ivreffects: IvrEffect[]
    }
    message: string
}
