import {z, ZodObject, ZodString} from 'zod'

export const schemaForgot: ZodObject<{ [index: string]: ZodString }> = z.object({
    forgotEmail: z.string().email({message: 'invalid_email'}),
})