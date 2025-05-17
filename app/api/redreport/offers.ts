'use server'
import Axios from 'axios'
import {setupCache} from 'axios-cache-interceptor'
import {CountryInfo} from '@/types/CountryInfo'
import {AreaInfo} from '@/types/AreaInfo'
import {NumberInfo} from '@/types/NumberInfo'

const instance = Axios.create()
const axios = setupCache(instance)

export async function getCountries({type}: { type: string }): Promise<CountryInfo[]> {
    const response = await axios.post(
        process.env.REDREPORT_URL + '/api/did/countries',
        'type=' + type,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                //'Authorization': 'Bearer ' + process.env.REDREPORT_TOKEN,
            },
            cache: {
                ttl: 4 * 60 * 60 * 1000,
            }
        }
    )
    if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data.data
    }
    return []
}

export async function getAreas({type, country}: { type: string, country: number }): Promise<AreaInfo[]> {
    const response = await axios.post(
        process.env.REDREPORT_URL + '/api/did/areas',
        'type=' + type + '&country_id=' + country,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                //'Authorization': 'Bearer ' + process.env.REDREPORT_TOKEN,
            },
            cache: {
                ttl: 2 * 60 * 60 * 1000,
            }
        }
    )
    if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data.data
    }
    return []
}

export async function getNumbers({type, country, area}: { type: string, country: number, area: number }): Promise<NumberInfo[]> {
    const response = await axios.post(
        process.env.REDREPORT_URL + '/api/did/numbers',
        'type=' + type + '&country_id=' + country + '&area_prefix=' + area,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                //'Authorization': 'Bearer ' + process.env.REDREPORT_TOKEN,
            },
            cache: {
                ttl: 10 * 60 * 1000,
            }
        }
    )
    if (response.data && response.data.data && response.data.data.length > 0) {
        const numbers: NumberInfo[] = response.data.data
        //console.log('getNumbers: ', numbers)
        return numbers.map(number => ({
            did: number.did,
            name: number.did + ' (' + number.where_did + ')',
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
    return []
}

export async function getDiscounts() {
    const response = await axios.get(
        process.env.REDREPORT_URL + '/api/did/discounts',
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                //'Authorization': 'Bearer ' + process.env.REDREPORT_TOKEN,
            },
            cache: {
                ttl: 30 * 24 * 60 * 60 * 1000,
            }
        }
    )
    if (response.data && response.data.data && response.data.data.length > 0) {
        const discounts: { months: number, percent: number }[] = response.data.data
        return discounts.map(discount => ({
            id: discount.percent.toString(),
            name: discount.months.toString(),
        }))
    }
    return []
}
