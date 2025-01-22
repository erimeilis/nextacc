import {z} from 'zod'
import parsePhoneNumberFromString, {isPossiblePhoneNumber, PhoneNumber} from 'libphonenumber-js'

function validatePhoneNumber(num: string) {
    const phoneNumber: PhoneNumber | undefined = parsePhoneNumberFromString(num)
    if (phoneNumber) {
        return isPossiblePhoneNumber(phoneNumber.formatInternational())
    } else return false
}

export const schemaPhone = z.string()
    .trim()
    .refine(
        (val) => validatePhoneNumber('+' + val.replace(/\D/g, '')), {
            message: 'invalid_phone',
        }
    )
    .transform(val => parsePhoneNumberFromString('+' + val.replace(/\D/g, ''))?.formatInternational().replace(/^\+/, ''))