/**
 * Stub Data Source
 *
 * Provides realistic mock data using @faker-js/faker for demo mode.
 * Data is seeded for consistency within a session but varies between users.
 */

import { faker } from '@faker-js/faker'
import type { DataSource, ApiResult } from './types'
import type { UserProfile } from '@/types/UserProfile'
import type { MoneyTransaction } from '@/types/MoneyTransaction'
import type { NumberInfo } from '@/types/NumberInfo'
import type { MyNumberInfo } from '@/types/MyNumberInfo'
import type { MyWaitingNumberInfo } from '@/types/MyWaitingNumberInfo'
import type { CartItem } from '@/types/CartItem'
import type { PaymentRegion } from '@/types/PaymentTypes'
import type { CallStatistics, SmsStatistics } from '@/types/Statistics'
import type { UploadInfo } from '@/types/UploadInfo'
import type { Ivr, IvrMusic, IvrEffect, IvrOrder, OrderIvrParams, OrderIvrResponse } from '@/types/IvrTypes'
import type { CountryInfo } from '@/types/CountryInfo'
import type { AreaInfo } from '@/types/AreaInfo'
import type { DiscountInfo } from './types'

// In-memory storage for demo data (per-session)
let stubProfile: UserProfile | null = null
let stubDids: NumberInfo[] | null = null
let stubWaitingDids: MyWaitingNumberInfo[] | null = null
let stubCart: CartItem[] = []
let stubTransactions: MoneyTransaction[] | null = null
let stubUploads: UploadInfo[] | null = null

// Seed faker for consistent data within session (currently unused, kept for future use)
// function seedFaker(userId?: string) {
//     if (userId) {
//         faker.seed(userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0))
//     }
// }

// Generate a phone number for a country
function generatePhoneNumber(countryCode: string): string {
    const prefixes: Record<string, string> = {
        US: '+1',
        GB: '+44',
        DE: '+49',
        FR: '+33',
        AU: '+61',
        CA: '+1',
        JP: '+81',
        LV: '+371',
    }
    const prefix = prefixes[countryCode] || '+1'
    return `${prefix}${faker.string.numeric(10)}`
}

// Generate countries (excluding RU per RULES.md)
const ALLOWED_COUNTRIES = ['US', 'GB', 'DE', 'FR', 'AU', 'CA', 'JP', 'LV', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'PL', 'CZ']

// Country data with prefixes for offers
// geo is the ISO 2-letter code used for flag images (flagcdn.com)
const COUNTRY_DATA: Record<string, { name: string; prefix: number; geo: string }> = {
    US: { name: 'United States', prefix: 1, geo: 'us' },
    GB: { name: 'United Kingdom', prefix: 44, geo: 'gb' },
    DE: { name: 'Germany', prefix: 49, geo: 'de' },
    FR: { name: 'France', prefix: 33, geo: 'fr' },
    AU: { name: 'Australia', prefix: 61, geo: 'au' },
    CA: { name: 'Canada', prefix: 1, geo: 'ca' },
    JP: { name: 'Japan', prefix: 81, geo: 'jp' },
    LV: { name: 'Latvia', prefix: 371, geo: 'lv' },
    IT: { name: 'Italy', prefix: 39, geo: 'it' },
    ES: { name: 'Spain', prefix: 34, geo: 'es' },
    NL: { name: 'Netherlands', prefix: 31, geo: 'nl' },
    BE: { name: 'Belgium', prefix: 32, geo: 'be' },
    AT: { name: 'Austria', prefix: 43, geo: 'at' },
    CH: { name: 'Switzerland', prefix: 41, geo: 'ch' },
    SE: { name: 'Sweden', prefix: 46, geo: 'se' },
    NO: { name: 'Norway', prefix: 47, geo: 'no' },
    DK: { name: 'Denmark', prefix: 45, geo: 'dk' },
    FI: { name: 'Finland', prefix: 358, geo: 'fi' },
    PL: { name: 'Poland', prefix: 48, geo: 'pl' },
    CZ: { name: 'Czech Republic', prefix: 420, geo: 'cz' },
}

// Area codes per country (all prefixes unique within each country)
const AREA_DATA: Record<string, { name: string; prefix: number }[]> = {
    US: [
        { name: 'New York', prefix: 212 },
        { name: 'Los Angeles', prefix: 213 },
        { name: 'Chicago', prefix: 312 },
        { name: 'San Francisco', prefix: 415 },
        { name: 'Miami', prefix: 305 },
        { name: 'Houston', prefix: 713 },
    ],
    GB: [
        { name: 'London', prefix: 20 },
        { name: 'Manchester', prefix: 161 },
        { name: 'Birmingham', prefix: 121 },
        { name: 'Edinburgh', prefix: 131 },
    ],
    DE: [
        { name: 'Berlin', prefix: 30 },
        { name: 'Munich', prefix: 89 },
        { name: 'Hamburg', prefix: 40 },
        { name: 'Frankfurt', prefix: 69 },
    ],
    FR: [
        { name: 'Paris', prefix: 1 },
        { name: 'Lyon', prefix: 472 },
        { name: 'Marseille', prefix: 491 },
        { name: 'Nice', prefix: 493 },
    ],
    AU: [
        { name: 'Sydney', prefix: 2 },
        { name: 'Melbourne', prefix: 3 },
        { name: 'Brisbane', prefix: 7 },
        { name: 'Perth', prefix: 8 },
    ],
    CA: [
        { name: 'Toronto', prefix: 416 },
        { name: 'Vancouver', prefix: 604 },
        { name: 'Montreal', prefix: 514 },
        { name: 'Calgary', prefix: 403 },
    ],
    JP: [
        { name: 'Tokyo', prefix: 3 },
        { name: 'Osaka', prefix: 6 },
        { name: 'Yokohama', prefix: 45 },
    ],
    LV: [
        { name: 'Riga', prefix: 67 },
        { name: 'Daugavpils', prefix: 65 },
    ],
    IT: [
        { name: 'Rome', prefix: 6 },
        { name: 'Milan', prefix: 2 },
        { name: 'Naples', prefix: 81 },
    ],
    ES: [
        { name: 'Madrid', prefix: 91 },
        { name: 'Barcelona', prefix: 93 },
        { name: 'Valencia', prefix: 96 },
    ],
    NL: [
        { name: 'Amsterdam', prefix: 20 },
        { name: 'Rotterdam', prefix: 10 },
        { name: 'The Hague', prefix: 70 },
    ],
    BE: [
        { name: 'Brussels', prefix: 2 },
        { name: 'Antwerp', prefix: 3 },
    ],
    AT: [
        { name: 'Vienna', prefix: 1 },
        { name: 'Salzburg', prefix: 662 },
    ],
    CH: [
        { name: 'Zurich', prefix: 44 },
        { name: 'Geneva', prefix: 22 },
        { name: 'Bern', prefix: 31 },
    ],
    SE: [
        { name: 'Stockholm', prefix: 8 },
        { name: 'Gothenburg', prefix: 317 },
    ],
    NO: [
        { name: 'Oslo', prefix: 22 },
        { name: 'Bergen', prefix: 55 },
    ],
    DK: [
        { name: 'Copenhagen', prefix: 33 },
        { name: 'Aarhus', prefix: 86 },
    ],
    FI: [
        { name: 'Helsinki', prefix: 9 },
        { name: 'Tampere', prefix: 33 },
    ],
    PL: [
        { name: 'Warsaw', prefix: 22 },
        { name: 'Krakow', prefix: 12 },
        { name: 'Gdansk', prefix: 58 },
    ],
    CZ: [
        { name: 'Prague', prefix: 2 },
        { name: 'Brno', prefix: 5 },
    ],
}

function randomCountry(): string {
    return faker.helpers.arrayElement(ALLOWED_COUNTRIES)
}

// Generate countries for offers
function generateCountries(type: string): CountryInfo[] {
    // Different types might have different country availability
    const availableCountries = type === 'tollfree'
        ? ['US', 'GB', 'DE', 'FR', 'CA', 'AU'] // Toll-free only in some countries
        : ALLOWED_COUNTRIES

    return availableCountries.map((code, index) => {
        const data = COUNTRY_DATA[code]
        return {
            id: index + 1,
            countryname: data.name,
            geo: data.geo,
            countryprefix: data.prefix,
        }
    })
}

// Generate areas for a country
function generateAreas(type: string, countryId: number): AreaInfo[] {
    const countries = generateCountries(type)
    const country = countries.find(c => c.id === countryId)
    if (!country) return []

    // Find the country code by matching the country name
    const countryCode = Object.entries(COUNTRY_DATA).find(
        ([, data]) => data.name === country.countryname
    )?.[0]

    if (!countryCode || !AREA_DATA[countryCode]) return []

    return AREA_DATA[countryCode].map(area => ({
        areaname: area.name,
        areaprefix: area.prefix,
    }))
}

// Generate available numbers for purchase
function generateAvailableNumbers(type: string, countryId: number, areaPrefix: number): NumberInfo[] {
    const countries = generateCountries(type)
    const country = countries.find(c => c.id === countryId)
    if (!country) return []

    const isTollFree = type === 'tollfree'
    const count = faker.number.int({ min: 3, max: 10 })

    return Array.from({ length: count }, (_, i) => {
        const localNumber = faker.string.numeric(7)
        const fullNumber = `+${country.countryprefix}${areaPrefix}${localNumber}`
        const hasVoice = isTollFree || faker.datatype.boolean({ probability: 0.9 })
        const hasSms = !isTollFree && faker.datatype.boolean({ probability: 0.7 })

        return {
            id: `avail-${countryId}-${areaPrefix}-${i}`,
            did: fullNumber,
            name: fullNumber,
            where_did: `${areaPrefix}, ${country.countryname}`,
            setup_rate: parseFloat(faker.finance.amount({ min: 0, max: isTollFree ? 20 : 5, dec: 2 })),
            fix_rate: parseFloat(faker.finance.amount({ min: isTollFree ? 5 : 1, max: isTollFree ? 25 : 10, dec: 2 })),
            voice: hasVoice,
            sms: hasSms,
            toll_free: isTollFree,
            incoming_per_minute: hasVoice ? parseFloat(faker.finance.amount({ min: 0.01, max: 0.05, dec: 3 })) : undefined,
            toll_free_rate_in_min: isTollFree ? parseFloat(faker.finance.amount({ min: 0.03, max: 0.15, dec: 3 })) : undefined,
            incoming_rate_sms: hasSms ? parseFloat(faker.finance.amount({ min: 0.01, max: 0.03, dec: 3 })) : undefined,
            docs_personal: faker.datatype.boolean({ probability: 0.3 }) ? ['passport', 'utility_bill'] : [],
            docs_business: faker.datatype.boolean({ probability: 0.2 }) ? ['registration', 'tax_id'] : [],
            autorenew: false, // New numbers default to no autorenew
            country_id: countryId,
        }
    })
}

// Generate discount tiers
function generateDiscounts(): DiscountInfo[] {
    return [
        { id: '5', name: '3' },   // 5% for 3 months
        { id: '10', name: '6' },  // 10% for 6 months
        { id: '15', name: '12' }, // 15% for 12 months
        { id: '20', name: '24' }, // 20% for 24 months
    ]
}

// Generate stub user profile
function generateProfile(): UserProfile {
    if (stubProfile) return stubProfile

    const country = randomCountry()
    stubProfile = {
        id: faker.number.int({ min: 1000, max: 99999 }),
        email: faker.internet.email(),
        email_confirm: true,
        phone: parseInt(faker.string.numeric(10)),
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        company: faker.company.name(),
        address: faker.location.streetAddress(),
        country: country,
        low_balance_notification: true,
        low_balance_edge: 10,
        subscribe_news: false,
        balance: parseFloat(faker.finance.amount({ min: 50, max: 500, dec: 2 })),
    }
    return stubProfile
}

// Generate stub DIDs
function generateDids(): NumberInfo[] {
    if (stubDids) return stubDids

    const count = faker.number.int({ min: 2, max: 5 })
    stubDids = Array.from({ length: count }, (_, i) => {
        const country = randomCountry()
        const hasVoice = faker.datatype.boolean()
        const hasSms = faker.datatype.boolean()
        const isTollFree = faker.datatype.boolean({ probability: 0.2 })

        return {
            id: `did-${i + 1}`,
            did: generatePhoneNumber(country),
            name: faker.helpers.arrayElement(['Main Line', 'Support', 'Sales', 'Marketing', 'Personal']),
            where_did: `${faker.location.city()}, ${country}`,
            setup_rate: parseFloat(faker.finance.amount({ min: 0, max: 10, dec: 2 })),
            fix_rate: parseFloat(faker.finance.amount({ min: 1, max: 15, dec: 2 })),
            voice: hasVoice,
            sms: hasSms,
            toll_free: isTollFree,
            incoming_per_minute: hasVoice ? parseFloat(faker.finance.amount({ min: 0.01, max: 0.1, dec: 3 })) : undefined,
            toll_free_rate_in_min: isTollFree ? parseFloat(faker.finance.amount({ min: 0.05, max: 0.2, dec: 3 })) : undefined,
            incoming_rate_sms: hasSms ? parseFloat(faker.finance.amount({ min: 0.01, max: 0.05, dec: 3 })) : undefined,
            docs_personal: [],
            docs_business: [],
            creation_date: faker.date.past({ years: 2 }).toISOString(),
            paid_till: faker.date.future({ years: 1 }).toISOString(),
            months_paid: faker.number.int({ min: 1, max: 24 }),
            autorenew: faker.datatype.boolean({ probability: 0.7 }),
            country_id: faker.number.int({ min: 1, max: 100 }),
        }
    })
    return stubDids
}

// Generate stub transactions
function generateTransactions(): MoneyTransaction[] {
    if (stubTransactions) return stubTransactions

    const count = faker.number.int({ min: 10, max: 30 })
    const operations = ['Payment', 'Monthly fee', 'Call charges', 'SMS charges', 'Top-up', 'Refund']

    stubTransactions = Array.from({ length: count }, () => ({
        datetime: faker.date.past({ years: 1 }),
        amount: parseFloat(faker.finance.amount({ min: -50, max: 100, dec: 2 })),
        operation: faker.helpers.arrayElement(operations),
        description: faker.lorem.sentence(),
        reseller: faker.datatype.boolean({ probability: 0.1 }),
    })).sort((a, b) => b.datetime.getTime() - a.datetime.getTime())

    return stubTransactions
}

// Generate waiting DIDs
function generateWaitingDids(): MyWaitingNumberInfo[] {
    if (stubWaitingDids) return stubWaitingDids

    const count = faker.number.int({ min: 0, max: 2 })
    stubWaitingDids = Array.from({ length: count }, (_, i) => {
        const country = randomCountry()
        return {
            id: `waiting-${i + 1}`,
            did: generatePhoneNumber(country),
            setup_rate: parseFloat(faker.finance.amount({ min: 0, max: 10, dec: 2 })),
            fix_rate: parseFloat(faker.finance.amount({ min: 1, max: 15, dec: 2 })),
            pay_sum: parseFloat(faker.finance.amount({ min: 10, max: 50, dec: 2 })),
            count_month: faker.number.int({ min: 1, max: 12 }),
            voiceDestType: 'sip',
            voiceDest: `sip:user@${faker.internet.domainName()}`,
            smsDestType: 'email',
            smsDest: faker.internet.email(),
            docs: [],
            voice: true,
            sms: faker.datatype.boolean(),
            toll_free: false,
            country_id: faker.number.int({ min: 1, max: 100 }),
        }
    })
    return stubWaitingDids
}

// Generate uploads
function generateUploads(): UploadInfo[] {
    if (stubUploads) return stubUploads

    const count = faker.number.int({ min: 0, max: 5 })
    stubUploads = Array.from({ length: count }, () => ({
        filename: `${faker.string.alphanumeric(16)}.${faker.helpers.arrayElement(['pdf', 'jpg', 'png'])}`,
        name: faker.system.fileName(),
        size: faker.number.int({ min: 1000, max: 5000000 }),
        created_at: faker.date.past({ years: 1 }).toISOString(),
        url: faker.internet.url(),
    }))
    return stubUploads
}

// Generate call statistics
function generateCallStatistics(startDate: string, endDate: string, did?: string): CallStatistics[] {
    const count = faker.number.int({ min: 5, max: 20 })
    const dids = did ? [did] : generateDids().map(d => d.did)

    return Array.from({ length: count }, () => {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const callDate = faker.date.between({ from: start, to: end })

        return {
            datetime: callDate.toISOString(),
            caller_id: generatePhoneNumber(randomCountry()),
            virtual_number: faker.helpers.arrayElement(dids),
            forwarding: `sip:user@${faker.internet.domainName()}`,
            duration: faker.number.int({ min: 0, max: 600 }),
            cost: parseFloat(faker.finance.amount({ min: 0, max: 5, dec: 3 })),
            status: faker.helpers.arrayElement(['completed', 'missed', 'busy', 'failed']),
        }
    }).sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
}

// Generate SMS statistics
function generateSmsStatistics(startDate: string, endDate: string, did?: string): SmsStatistics[] {
    const count = faker.number.int({ min: 3, max: 15 })
    const dids = did ? [did] : generateDids().filter(d => d.sms).map(d => d.did)

    if (dids.length === 0) return []

    return Array.from({ length: count }, (_, i) => {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const smsDate = faker.date.between({ from: start, to: end })

        return {
            id: i + 1,
            date: smsDate.toISOString(),
            id_cc_provider: faker.number.int({ min: 1, max: 10 }),
            default_cost: parseFloat(faker.finance.amount({ min: 0.01, max: 0.1, dec: 3 })),
            ip: faker.internet.ip(),
            from_number: generatePhoneNumber(randomCountry()),
            to_number: faker.helpers.arrayElement(dids),
            sms_text: faker.lorem.sentence(),
            id_incoming_sms_stat: i + 1,
            full_request: '{}',
            status: faker.helpers.arrayElement(['delivered', 'pending', 'failed']),
            incoming_sms_stat: {
                id: i + 1,
                id_incoming_sms: i + 1,
                id_cc_card: faker.number.int({ min: 1, max: 1000 }),
                id_cc_did: faker.number.int({ min: 1, max: 1000 }),
                send_email: faker.datatype.boolean(),
                send_http: faker.datatype.boolean(),
                http_respond: '',
                cost_sms: parseFloat(faker.finance.amount({ min: 0.01, max: 0.1, dec: 3 })),
            },
        }
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Generate IVR options
function generateIvrOptions(): { ivr: Ivr[]; ivrmusic: IvrMusic[]; ivreffects: IvrEffect[] } {
    const languages = ['en', 'de', 'fr', 'es', 'it', 'lv']
    const genders = ['male', 'female']

    const ivr: Ivr[] = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        name: faker.helpers.arrayElement(['Professional', 'Friendly', 'Corporate', 'Casual', 'Premium']),
        description: faker.lorem.sentence(),
        lang: faker.helpers.arrayElement(languages),
        client_lang: 'en',
        price: parseFloat(faker.finance.amount({ min: 5, max: 50, dec: 2 })),
        multiplier: 1,
        music_inc: faker.number.int({ min: 0, max: 3 }),
        file: faker.number.int({ min: 1, max: 100 }),
        gender: faker.helpers.arrayElement(genders),
        price_add: null,
        filelink: {
            id: faker.number.int({ min: 1, max: 1000 }),
            original_name: `ivr_sample_${i + 1}.mp3`,
            url: faker.internet.url(),
        },
    }))

    const ivrmusic: IvrMusic[] = Array.from({ length: 3 }, (_, i) => ({
        id: i + 1,
        name: faker.helpers.arrayElement(['Jazz', 'Classical', 'Pop', 'Ambient']),
        description: faker.lorem.sentence(),
        filelink: {
            id: faker.number.int({ min: 1, max: 1000 }),
            original_name: `music_${i + 1}.mp3`,
            url: faker.internet.url(),
        },
    }))

    const ivreffects: IvrEffect[] = Array.from({ length: 2 }, (_, i) => ({
        id: i + 1,
        name: faker.helpers.arrayElement(['Echo', 'Reverb', 'None']),
        description: null,
        filelink: {
            id: faker.number.int({ min: 1, max: 1000 }),
            original_name: `effect_${i + 1}.mp3`,
            url: faker.internet.url(),
        },
    }))

    return { ivr, ivrmusic, ivreffects }
}

// Generate payment methods
function generatePaymentMethods(): PaymentRegion[] {
    const regions: PaymentRegion[] = [
        {
            region: 'Europe',
            subregion: 'Western Europe',
            types: ['card', 'bank'],
            methods: {
                visa: {
                    name: 'Visa/Mastercard',
                    test: 'false',
                    active: 'true',
                    method: 'card',
                    cours: 1,
                    full_summ: 0,
                    description: 'Pay with credit or debit card',
                    valute: 'EUR',
                    type: 'card',
                },
                sepa: {
                    name: 'SEPA Bank Transfer',
                    test: 'false',
                    active: 'true',
                    method: 'bank',
                    cours: 1,
                    full_summ: 0,
                    description: 'Pay via bank transfer',
                    valute: 'EUR',
                    type: 'bank',
                },
            },
        },
        {
            region: 'Americas',
            subregion: 'North America',
            types: ['card', 'crypto'],
            methods: {
                stripe: {
                    name: 'Credit Card (Stripe)',
                    test: 'false',
                    active: 'true',
                    method: 'card',
                    cours: 1,
                    full_summ: 0,
                    description: 'Pay with credit or debit card',
                    valute: 'USD',
                    type: 'card',
                },
                crypto: {
                    name: 'Cryptocurrency',
                    test: 'false',
                    active: 'true',
                    method: 'crypto',
                    cours: 1,
                    full_summ: 0,
                    description: 'Pay with Bitcoin, Ethereum, etc.',
                    valute: 'USD',
                    type: 'crypto',
                },
            },
        },
    ]
    return regions
}

// Stub Data Source implementation
export const stubDataSource: DataSource = {
    // Profile
    async getProfile(): Promise<UserProfile | null> {
        await simulateLatency()
        return generateProfile()
    },

    async updateProfile(fields: Partial<UserProfile>): Promise<UserProfile | null> {
        await simulateLatency()
        const profile = generateProfile()
        stubProfile = { ...profile, ...fields }
        return stubProfile
    },

    // Transactions
    async getTransactions(): Promise<MoneyTransaction[] | null> {
        await simulateLatency()
        return generateTransactions()
    },

    // DIDs
    async getMyDids(): Promise<NumberInfo[] | null> {
        await simulateLatency()
        return generateDids()
    },

    async getDidSettings(number: string): Promise<MyNumberInfo | null> {
        await simulateLatency()
        const dids = generateDids()
        const did = dids.find(d => d.did === number)
        if (!did) return null

        return {
            id: did.id,
            did: did.did,
            name: did.name,
            autorenew: did.autorenew,
            // ExtManInfo
            ff_num: undefined,
            type_num1: 'sip',
            f_num1: `sip:user@${faker.internet.domainName()}`,
            f_time1: 30,
            vm: 1,
            vm_email: faker.internet.email(),
            vm_beep: true,
            hello_enable: false,
            show_real_caller_id: true,
            // CallDestinationInfo
            call_destination: `sip:user@${faker.internet.domainName()}`,
            call_priority: 1,
            call_activated: true,
            voip_call: true,
            // SmsDestinationInfo
            sms_activated: did.sms,
            forward_email_activate: true,
            forward_email: faker.internet.email(),
        }
    },

    async updateDidSettings(number: string, data: Partial<MyNumberInfo>): Promise<MyNumberInfo | null> {
        await simulateLatency()
        const current = await this.getDidSettings(number)
        if (!current) return null
        return { ...current, ...data }
    },

    async deleteDid(number: string): Promise<NumberInfo[] | null> {
        await simulateLatency()
        if (stubDids) {
            stubDids = stubDids.filter(d => d.did !== number)
        }
        return generateDids()
    },

    // Waiting DIDs
    async getWaitingDids(): Promise<MyWaitingNumberInfo[] | null> {
        await simulateLatency()
        return generateWaitingDids()
    },

    async confirmWaitingDid(id: string): Promise<ApiResult<MyWaitingNumberInfo>> {
        await simulateLatency()
        const waiting = generateWaitingDids()
        const item = waiting.find(w => w.id === id)
        if (!item) {
            return { data: null, error: { status: 404, message: 'not_found' } }
        }
        // Move to active DIDs
        if (stubWaitingDids) {
            stubWaitingDids = stubWaitingDids.filter(w => w.id !== id)
        }
        return { data: item }
    },

    async deleteWaitingDid(id: string): Promise<ApiResult<MyWaitingNumberInfo[]>> {
        await simulateLatency()
        if (stubWaitingDids) {
            stubWaitingDids = stubWaitingDids.filter(w => w.id !== id)
        }
        return { data: generateWaitingDids() }
    },

    // Cart
    async getCart(_uid: string): Promise<CartItem[] | null> {
        void _uid // In demo mode, return all cart items regardless of uid
        await simulateLatency()
        return stubCart
    },

    async addToCart(params): Promise<ApiResult<CartItem[]>> {
        await simulateLatency()
        if (!params.number) {
            return { data: null, error: { status: 400, message: 'no_number' } }
        }

        const newItem: CartItem = {
            id: Date.now(),
            did: params.number.did,
            where_did: params.number.where_did || '',
            count_month: params.qty,
            sum: (params.number.setup_rate + params.number.fix_rate * params.qty),
            date: new Date().toISOString(),
            voice: params.voice,
            sms: params.sms,
            did_info: {
                id: params.number.id,
                setup_rate: params.number.setup_rate,
                fix_rate: params.number.fix_rate,
                voice: params.number.voice,
                sms: params.number.sms,
                toll_free: params.number.toll_free,
                docs_personal: params.number.docs_personal,
                docs_business: params.number.docs_business,
                autorenew: params.number.autorenew,
            },
            docs: params.docs as { [key: string]: string },
        }
        stubCart.push(newItem)
        return { data: stubCart }
    },

    async removeFromCart(uid: string, ids: number[]): Promise<CartItem[] | null> {
        await simulateLatency()
        stubCart = stubCart.filter(item => !ids.includes(item.id))
        return stubCart
    },

    // Buy
    async buyNumbers(params): Promise<ApiResult<MyNumberInfo | MyWaitingNumberInfo>> {
        await simulateLatency()
        // Simulate successful purchase - return first number as confirmed
        if (params.numbers.length === 0) {
            return { data: null, error: { status: 400, message: 'no_numbers' } }
        }

        const number = params.numbers[0]
        const result: MyNumberInfo = {
            id: `new-${Date.now()}`,
            did: number.did,
            name: number.name,
            autorenew: true,
            call_destination: params.voice?.destination,
            call_activated: true,
            sms_activated: !!params.sms,
            forward_email: params.sms?.destination,
        }

        // Clear cart after purchase
        stubCart = []

        // Add to DIDs
        if (!stubDids) stubDids = []
        stubDids.push(number)

        return { data: result }
    },

    // Payments
    async getPaymentMethods(sum?: number): Promise<PaymentRegion[] | null> {
        await simulateLatency()
        const methods = generatePaymentMethods()
        // Update full_summ if sum provided
        if (sum) {
            methods.forEach(region => {
                Object.values(region.methods).forEach(method => {
                    method.full_summ = sum * method.cours
                })
            })
        }
        return methods
    },

    async makePayment(amount: number, paymentMethod: string): Promise<Record<string, unknown> | null> {
        await simulateLatency()
        // Simulate successful payment
        if (stubProfile) {
            stubProfile.balance += amount
        }
        return {
            success: true,
            transaction_id: `txn_${Date.now()}`,
            amount,
            method: paymentMethod,
        }
    },

    // Statistics
    async getCallStatistics(params): Promise<CallStatistics[] | null> {
        await simulateLatency()
        return generateCallStatistics(params.startDate, params.endDate, params.did)
    },

    async getSmsStatistics(params): Promise<SmsStatistics[] | null> {
        await simulateLatency()
        return generateSmsStatistics(params.startDate, params.endDate, params.did)
    },

    // Uploads
    async getUploads(): Promise<UploadInfo[] | null> {
        await simulateLatency()
        return generateUploads()
    },

    async uploadFile(file: File, type: string): Promise<ApiResult<UploadInfo>> {
        void type // Parameter required by interface but not used in stub
        await simulateLatency()
        const upload: UploadInfo = {
            filename: `${faker.string.alphanumeric(16)}.${file.name.split('.').pop()}`,
            name: file.name,
            size: file.size,
            created_at: new Date().toISOString(),
            url: faker.internet.url(),
        }
        if (!stubUploads) stubUploads = []
        stubUploads.push(upload)
        return { data: upload }
    },

    async deleteUpload(filename: string): Promise<ApiResult<UploadInfo[]>> {
        await simulateLatency()
        if (stubUploads) {
            stubUploads = stubUploads.filter(u => u.filename !== filename)
        }
        return { data: stubUploads || [] }
    },

    // IVR
    async getIvrOptions(): Promise<{ ivr: Ivr[]; ivrmusic: IvrMusic[]; ivreffects: IvrEffect[] } | null> {
        await simulateLatency()
        return generateIvrOptions()
    },

    async getIvrOrders(): Promise<IvrOrder[] | null> {
        await simulateLatency()
        // Generate some past orders
        const count = faker.number.int({ min: 0, max: 3 })
        return Array.from({ length: count }, () => ({
            client_id: faker.string.alphanumeric(8),
            amount: faker.finance.amount({ min: 10, max: 100, dec: 2 }),
            duration: faker.number.int({ min: 10, max: 120 }).toString(),
            ivr_id: faker.number.int({ min: 1, max: 5 }).toString(),
            ivr_music_id: faker.number.int({ min: 1, max: 3 }).toString(),
            text: faker.lorem.paragraph(),
            paid: faker.datatype.boolean({ probability: 0.8 }),
            created_at: faker.date.past({ years: 1 }).toISOString(),
        }))
    },

    async orderIvr(params: OrderIvrParams): Promise<OrderIvrResponse | null> {
        void params // Parameter required by interface but not used in stub
        await simulateLatency()
        return {
            code: 200,
            message: 'Order placed successfully',
        }
    },

    // Offers (public data)
    async getCountries(type: string): Promise<CountryInfo[]> {
        await simulateLatency()
        return generateCountries(type)
    },

    async getAreas(type: string, countryId: number): Promise<AreaInfo[]> {
        await simulateLatency()
        return generateAreas(type, countryId)
    },

    async getAvailableNumbers(type: string, countryId: number, areaPrefix: number): Promise<NumberInfo[]> {
        await simulateLatency()
        return generateAvailableNumbers(type, countryId, areaPrefix)
    },

    async getDiscounts(): Promise<DiscountInfo[]> {
        await simulateLatency()
        return generateDiscounts()
    },
}

// Simulate network latency (50-200ms)
async function simulateLatency(): Promise<void> {
    const delay = faker.number.int({ min: 50, max: 200 })
    await new Promise(resolve => setTimeout(resolve, delay))
}

// Reset all stub data (useful for testing)
export function resetStubData(): void {
    stubProfile = null
    stubDids = null
    stubWaitingDids = null
    stubCart = []
    stubTransactions = null
    stubUploads = null
}
