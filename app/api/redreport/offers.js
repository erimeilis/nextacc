'use server'
import axios from 'axios'

export async function getCountries({type}) {
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
            //console.log(response.data.data.length)
            return response.data.data.map(country => ({
                id: country.id,
                name: country.countryname + ' (+' + country.countryprefix + ')',
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

export async function getAreas({type, country}) {
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
            //console.log(response.data.data.length)
            return response.data.data.map(area => ({
                id: area.areaprefix,
                name: area.areaname + ' (+' + area.areaprefix + ')',
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

export async function getNumbers({type, country, area}) {
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
            //console.log(response.data.data.length)
            //console.log(response.data)
            return response.data.data.map(number => ({
                id: number.did,
                name: number.did + ' (' + number.where_did + ')',
                where_did: number.where_did,
                setuprate: number.setuprate,
                fixrate: number.fixrate,
                incoming_per_minute: number.incoming_per_minute,
                tollfree_rate_in_min: number.tollfree_rate_in_min,
                incoming_rate_sms: number.incoming_rate_sms,
                docs: JSON.stringify(number.docs)
            }))
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log('getNumbers ' + error.status)
            return null
        } else {
            console.error(error)
            return null
        }
    }
}