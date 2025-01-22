import {z} from 'zod'

export const schemaTelegram = z.string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z]+[a-z0-9_]{4,31}$/, {
        message: 'invalid_telegram_username',
    })
    .transform(val => val.toLowerCase())