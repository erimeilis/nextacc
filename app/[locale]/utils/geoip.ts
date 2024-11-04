import {headers} from 'next/headers'

export async function geoip() {
    const ip = headers().get('cf-connecting-ip') ?? headers().get('x-real-ip') ?? headers().get('x-original-forwarded-for') ?? headers().get('x-forwarded-for')
    console.log(ip)
    const geoIp = await fetch('https://geolocation-db.com/json/' + ip).then((response) => response.json())
    return geoIp.country_code === 'Not found' ? 'HN' : geoIp.country_code
}