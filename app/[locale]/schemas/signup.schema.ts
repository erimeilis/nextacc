import {z} from 'zod'
import {isValidPhoneNumber, parsePhoneNumber} from 'libphonenumber-js'

export const schemaSignup = z.object({
    signupPhone: z.string().refine(isValidPhoneNumber, 'invalid_phone')
        .transform((value) => parsePhoneNumber(value).number.toString()),
    signupEmail: z.string().email({message: 'invalid_email'}),
    signupPassword: z.string().min(5, {message: 'short_password'}),
    signupConfirmPassword: z.string().min(5, {message: 'short_password'})
}).superRefine(({signupConfirmPassword, signupPassword}, ctx) => {
    if (signupConfirmPassword !== signupPassword) {
        ctx.addIssue({
            code: 'custom',
            message: 'passwords_mismatch',
            path: ['signupConfirmPassword']
        })
    }
})