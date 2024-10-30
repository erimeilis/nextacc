import {z} from 'zod'

export const schemaSignup = z.object({
    signupPhone: z.string().min(10, {message: 'invalid_phone'})
        .max(14, {message: 'invalid_phone'}),
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