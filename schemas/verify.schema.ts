import {z, ZodObject, ZodString} from 'zod'

export const schemaVerify: ZodObject<{ [index: string]: ZodString }> = z.object({
    verifyEmail: z.string().email({message: 'invalid_email'}),
})