import {headers} from 'next/headers'

export async function geoip() {
    const ip = (await headers()).get('cf-connecting-ip') ?? (await headers()).get('x-real-ip') ?? (await headers()).get('x-original-forwarded-for') ?? (await headers()).get('x-forwarded-for')
    console.log(ip)
    const geoIp = await fetch('https://geolocation-db.com/json/' + ip).then((response) => response.json())
    return geoIp.country_code === 'Not found' ? 'HN' : geoIp.country_code
}