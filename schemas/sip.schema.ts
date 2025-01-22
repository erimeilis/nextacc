import {z} from 'zod'

export const schemaSip = z.string()
    .trim()
    .toLowerCase()
    .regex(/^(sips?)([:\/])([^@]+)(?:@(.+))?$/, {
        message: 'invalid_sip',
    })
    .transform(val => 'sip/' + val.toLowerCase().replace(/^sips?[:\/]/, ''))