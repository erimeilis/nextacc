'use client'
import {ClientInfo} from '@/types/ClientInfo'
import {slack} from '@/utils/slack'

export async function getClientInfo(): Promise<ClientInfo | null> {
    const res = await fetch('https://ipinfo.io/json?token=39d5c35f2d7eb1')
    const info = await res.json()
    await slack(info.ip)
    return info
}