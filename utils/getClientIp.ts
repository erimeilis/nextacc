import {headers} from 'next/headers'

export async function getClientIp(): Promise<string | null> {
    try {
        const headersList = await headers();
        return headersList.get('cf-connecting-ip') ?? 
               headersList.get('x-real-ip') ?? 
               headersList.get('x-original-forwarded-for') ?? 
               headersList.get('x-forwarded-for') ?? 
               null;
    } catch (error) {
        console.error('Error getting client IP:', error);
        return null;
    }
}