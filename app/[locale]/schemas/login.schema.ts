import {z, ZodObject, ZodString} from 'zod'

export const schemaLogin: ZodObject<{ [index: string]: ZodString }> = z.object({
    loginEmail: z.string().email({message: 'invalid_email'}),
    loginPassword: z.string().min(5, {message: 'short_password'})
})