'use server'
import {CountryInfo} from '@/types/CountryInfo'
import {AreaInfo} from '@/types/AreaInfo'
import {NumberInfo} from '@/types/NumberInfo'
import {fetchWithCache} from '@/utils/fetchCache'

export async function redGetCountries({type}: { type: string }): Promise<CountryInfo[]> {
    const url = new URL(process.env.REDREPORT_URL + '/api/offers/countries')
    url.searchParams.append('type', type)
    //const ttl = 60 * 60 * 1000 // 1 hour

    try {
        const response = await fetchWithCache<{ data: CountryInfo[] }>(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                //'Authorization': 'Bearer ' + process.env.REDREPORT_TOKEN,
            },
            //ttl: ttl
        })

        if (response && response.data && response.data.length > 0) {
            return response.data
        }
    } catch (error) {
        console.error('Error fetching countries:', error)
    }

    return []
}

export async function redGetAreas({type, country}: { type: string, country: number }): Promise<AreaInfo[]> {
    const url = new URL(process.env.REDREPORT_URL + '/api/offers/areas')
    url.searchParams.append('type', type)
    url.searchParams.append('country_id', country.toString())
    //const ttl = 10 * 60 * 1000 // 10 minutes

    try {
        const response = await fetchWithCache<{ data: AreaInfo[] }>(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                //'Authorization': 'Bearer ' + process.env.REDREPORT_TOKEN,
            },
            //ttl: ttl
        })

        if (response && response.data && response.data.length > 0) {
            return response.data
        }
    } catch (error) {
        console.error('Error fetching areas:', error)
    }

    return []
}

export async function redGetNumbers({type, country, area}: { type: string, country: number, area: number }): Promise<NumberInfo[]> {
    const url = new URL(process.env.REDREPORT_URL + '/api/offers/numbers')
    url.searchParams.append('type', type)
    url.searchParams.append('country_id', country.toString())
    url.searchParams.append('area_prefix', area.toString())
    //const ttl = 2 * 60 * 1000 // 2 minutes

    // Define a type based on NumberInfo for the API response
    type NumberResponseRaw = {
        [K in keyof Omit<NumberInfo, 'name' | 'docs'>]:
        K extends 'setup_rate' | 'fix_rate' | 'incoming_per_minute' | 'toll_free_rate_in_min' | 'incoming_rate_sms'
            ? string | number | null
            : K extends 'voice' | 'sms' | 'toll_free'
                ? boolean | undefined
                : NumberInfo[K]
    } & {
        //docs: unknown;
        docs_personal: unknown
        docs_business: unknown
    }

    try {
        const response = await fetchWithCache<{ data: NumberResponseRaw[] }>(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                //'Authorization': 'Bearer ' + process.env.REDREPORT_TOKEN,
            },
            //ttl: ttl
        })

        if (response && response.data && response.data.length > 0) {
            const numbers: NumberResponseRaw[] = response.data
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
                //docs: number.docs as Record<string, number>,
                docs_personal: number.docs_personal as string[],
                docs_business: number.docs_business as string[],
            } as NumberInfo))
        }
    } catch (error) {
        console.error('Error fetching numbers:', error)
    }

    return []
}

export async function redGetDiscounts() {
    const url = process.env.REDREPORT_URL + '/api/offers/discounts'

    //const ttl = 30 * 24 * 60 * 60 * 1000 // 30 days

    interface DiscountResponse {
        months: number;
        percent: number;
    }

    try {
        const response = await fetchWithCache<{ data: DiscountResponse[] }>(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                //'Authorization': 'Bearer ' + process.env.REDREPORT_TOKEN,
            },
            //ttl: ttl
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
