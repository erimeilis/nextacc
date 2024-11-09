'use server'
import axios from 'axios'
import {CountryInfo} from '@/app/api/types/CountryInfo'
import {AreaInfo} from '@/app/api/types/AreaInfo'
import {NumberInfo} from '@/app/api/types/NumberInfo'

export async function getCountries({type}: { type: string }) {
    try {
        const response = await axios.post(
            process.env.REDREPORT_URL + '/api/did/countries',
            'type=' + type,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    //'Authorization': 'Bearer ' + process.env.REDREPORT_TOKEN,
                }
            }
        )
        if (response.data && response.data.data && response.data.data.length > 0) {
            const countries: CountryInfo[] = response.data.data
            return countries.map(country => ({
                id: country.id,
                name: country.countryname + ' +' + country.countryprefix.toString(),
            }))
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log('getCountries ' + error.status)
            return null
        } else {
            console.error(error)
            return null
        }
    }
}

export async function getAreas({type, country}: { type: string, country: number }) {
    try {
        const response = await axios.post(
            process.env.REDREPORT_URL + '/api/did/areas',
            'type=' + type + '&country_id=' + country,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    //'Authorization': 'Bearer ' + process.env.REDREPORT_TOKEN,
                }
            }
        )
        if (response.data && response.data.data && response.data.data.length > 0) {
            const areas: AreaInfo[] = response.data.data
            return areas.map(area => ({
                id: area.areaprefix,
                name: '(' + area.areaprefix.toString() + ') ' + area.areaname,
            }))
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log('getAreas ' + error.status)
            return null
        } else {
            console.error(error)
            return null
        }
    }
}

export async function getNumbers({type, country, area}: { type: string, country: number, area: number }): Promise<NumberInfo[]> {
    try {
        const response = await axios.post(
            process.env.REDREPORT_URL + '/api/did/numbers',
            'type=' + type + '&country_id=' + country + '&area_prefix=' + area,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    //'Authorization': 'Bearer ' + process.env.REDREPORT_TOKEN,
                }
            }
        )
        if (response.data && response.data.data && response.data.data.length > 0) {
            const numbers: NumberInfo[] = response.data.data
            return numbers.map(number => ({
                did: number.did,
                name: number.did + ' (' + number.where_did + ')',
                where_did: number.where_did,
                setuprate: number.setuprate,
                fixrate: number.fixrate,
                incoming_per_minute: number.incoming_per_minute,
                tollfree_rate_in_min: number.tollfree_rate_in_min,
                incoming_rate_sms: number.incoming_rate_sms,
                docs: JSON.stringify(number.docs)
            } as NumberInfo))
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log('getNumbers ' + error.status)
        } else {
            console.error(error)
        }
    }
    return []
}