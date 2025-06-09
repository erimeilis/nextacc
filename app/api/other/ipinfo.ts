'use client'
import {ClientInfo} from '@/types/ClientInfo'

export async function getClientInfo(): Promise<ClientInfo | null> {
    const res = await fetch('https://ipinfo.io/json?token=39d5c35f2d7eb1')
    //await slack(info.ip)
    return await res.json()
}
