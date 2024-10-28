import {z} from 'zod'

export const schemaForgot = z.object({
    forgotEmail: z.string().email({message: 'invalid_email'}),
})