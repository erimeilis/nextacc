import {z} from 'zod'

export const schemaLogin = z.object({
    loginEmail: z.string().email({message: 'invalid_email'}),
    loginPassword: z.string().min(5, {message: 'short_password'})
})