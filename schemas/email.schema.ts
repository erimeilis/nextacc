import {z} from 'zod'

export const schemaEmail = z.string()
    .trim()
    .email({message: 'invalid_email'})