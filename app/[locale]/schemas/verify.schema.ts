import {z} from 'zod'

export const schemaVerify = z.object({
    verifyEmail: z.string().email({message: 'invalid_email'}),
})