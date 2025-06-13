'use server'
import {CountryInfo} from '@/types/CountryInfo'
import {AreaInfo} from '@/types/AreaInfo'
import {NumberInfo} from '@/types/NumberInfo'
import {fetchWithCache} from '@/utils/fetchCache'

export async function getCountries({type}: { type: string }): Promise<CountryInfo[]> {
    const url = process.env.REDREPORT_URL + '/api/did/countries'
    const ttl = 60 * 60 * 1000 // 1 hour

    try {
        const response = await fetchWithCache<{ data: CountryInfo[] }>(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                //'Authorization': 'Bearer ' + process.env.REDREPORT_TOKEN,
            },
            body: 'type=' + type,
            ttl: ttl
        })

        if (response && response.data && response.data.length > 0) {
            return response.data
        }
    } catch (error) {
        console.error('Error fetching countries:', error)
    }

    return []
}

export async function getAreas({type, country}: { type: string, country: number }): Promise<AreaInfo[]> {
    const url = process.env.REDREPORT_URL + '/api/did/areas'
    const ttl = 10 * 60 * 1000 // 10 minutes

    try {
        const response = await fetchWithCache<{ data: AreaInfo[] }>(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                //'Authorization': 'Bearer ' + process.env.REDREPORT_TOKEN,
            },
            body: 'type=' + type + '&country_id=' + country,
            ttl: ttl
        })

        if (response && response.data && response.data.length > 0) {
            return response.data
        }
    } catch (error) {
        console.error('Error fetching areas:', error)
    }

    return []
}

export async function getNumbers({type, country, area}: { type: string, country: number, area: number }): Promise<NumberInfo[]> {
    const url = process.env.REDREPORT_URL + '/api/did/numbers'
    const ttl = 2 * 60 * 1000 // 2 minutes

    // Define a type based on NumberInfo for the API response
    type NumberResponseRaw = {
        [K in keyof Omit<NumberInfo, 'name' | 'docs'>]:
        K extends 'setup_rate' | 'fix_rate' | 'incoming_per_minute' | 'toll_free_rate_in_min' | 'incoming_rate_sms'
            ? string | number | null
            : K extends 'voice' | 'sms' | 'toll_free'
                ? boolean | undefined
                : NumberInfo[K]
    } & {
        docs: unknown;
    }

    try {
        const response = await fetchWithCache<{ data: NumberResponseRaw[] }>(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                //'Authorization': 'Bearer ' + process.env.REDREPORT_TOKEN,
            },
            body: 'type=' + type + '&country_id=' + country + '&area_prefix=' + area,
            ttl: ttl
        })

        if (response && response.data && response.data.length > 0) {
            const numbers: NumberResponseRaw[] = response.data
            //console.log('getNumbers: ', numbers)
            return numbers.map(number => ({
                did: number.did,
                //name: number.did + ' (' + number.where_did + ')',
                name: number.did,
                where_did: number.where_did,
                setup_rate: Number(number.setup_rate),
                fix_rate: Number(number.fix_rate),
                voice: number.voice ?? false,
                sms: number.sms ?? false,
                toll_free: number.toll_free ?? false,
                incoming_per_minute: number.incoming_per_minute ? Number(number.incoming_per_minute) : null,
                toll_free_rate_in_min: number.toll_free_rate_in_min ? Number(number.toll_free_rate_in_min) : null,
                incoming_rate_sms: number.incoming_rate_sms ? Number(number.incoming_rate_sms) : null,
                docs: JSON.stringify(number.docs)
            } as NumberInfo))
        }
    } catch (error) {
        console.error('Error fetching numbers:', error)
    }

    return []
}

export async function getDiscounts() {
    const url = process.env.REDREPORT_URL + '/api/did/discounts'
    const ttl = 30 * 24 * 60 * 60 * 1000 // 30 days

    interface DiscountResponse {
        months: number;
        percent: number;
    }

    try {
        const response = await fetchWithCache<{ data: DiscountResponse[] }>(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                //'Authorization': 'Bearer ' + process.env.REDREPORT_TOKEN,
            },
            ttl: ttl
        })

        if (response && response.data && response.data.length > 0) {
            const discounts: DiscountResponse[] = response.data
            return discounts.map(discount => ({
                id: discount.percent.toString(),
                name: discount.months.toString(),
            }))
        }
    } catch (error) {
        console.error('Error fetching discounts:', error)
    }

    return []
}
