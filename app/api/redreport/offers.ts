'use server'
import Axios from 'axios'
import {setupCache} from 'axios-cache-interceptor'
import {CountryInfo} from '@/types/CountryInfo'
import {AreaInfo} from '@/types/AreaInfo'
import {NumberInfo} from '@/types/NumberInfo'

export async function getCountries({type}: { type: string }) {
    const instance = Axios.create()
    const axios = setupCache(instance)
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
            id: String(country.id),
            name: country.countryname + ' +' + country.countryprefix.toString(),
        }))
    }
    axios.interceptors.response.use(
        response => response,
        error => {
            console.log('getCountries ' + error.status)
            return null
        })
}

export async function getAreas({type, country}: { type: string, country: number }) {
    const instance = Axios.create()
    const axios = setupCache(instance)
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
            id: String(area.areaprefix),
            name: '(' + area.areaprefix.toString() + ') ' + area.areaname,
        }))
    }
    axios.interceptors.response.use(
        response => response,
        error => {
            console.log('getAreas ' + error.status)
            return null
        })
}

export async function getNumbers({type, country, area}: { type: string, country: number, area: number }): Promise<NumberInfo[]> {
    const instance = Axios.create()
    const axios = setupCache(instance)
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
        //console.log('getNumbers: ', numbers)
        return numbers.map(number => ({
            did: number.did,
            name: number.did + ' (' + number.where_did + ')',
            where_did: number.where_did,
            setuprate: number.setuprate,
            fixrate: number.fixrate,
            voice: number.voice,
            sms: number.sms,
            tollfree: number.tollfree,
            fax: number.fax,
            incoming_per_minute: number.incoming_per_minute,
            tollfree_rate_in_min: number.tollfree_rate_in_min,
            incoming_rate_sms: number.incoming_rate_sms,
            docs: JSON.stringify(number.docs)
        } as NumberInfo))
    }
    axios.interceptors.response.use(
        response => response,
        error => {
            console.log('getNumbers ' + error.status)
        })
    return []
}