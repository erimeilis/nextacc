'use server'
import {auth} from '@/auth'
import {UploadInfo} from '@/types/UploadInfo'

export async function redGetMyUploads(): Promise<UploadInfo[] | null> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') return null

    const url = new URL(process.env.REDREPORT_URL + '/api/kc/uploads')
    url.searchParams.append('site_id', process.env.SITE_ID || '')

    const options: RequestInit = {
        cache: 'reload',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + session?.token,
        }
    }
    return fetch(url.toString(), options)
        .then(async (res: Response) => {
            console.log('redGetMyUploads: ', res.status)
            if (!res.ok) {
                const errorData = await res.json()
                console.log('redGetMyUploads error response: ', errorData)
                return null
            }
            return res.json()
        })
        .then(async (data) => {
            return data.data.uploads
        })
        .catch((err) => {
            console.log('redGetMyUploads error: ', err.message)
            return null
        })
}

export async function redUploadFile(file: File): Promise<UploadInfo[] | null> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') return null

    const url = new URL(process.env.REDREPORT_URL + '/api/kc/uploads')
    url.searchParams.append('site_id', process.env.SITE_ID || '')

    const formData = new FormData()
    formData.append('file', file)

    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + session?.token,
        },
        body: formData
    }

    return fetch(url.toString(), options)
        .then(async (res: Response) => {
            console.log('redUploadFile: ', res.status)
            if (!res.ok) {
                const errorData = await res.json()
                console.log('redUploadFile error response: ', errorData)
                return null
            }
            return res.json()
        })
        .then(async (data) => {
            return data.data.uploads
        })
        .catch((err) => {
            console.log('redUploadFile error: ', err.message)
            return null
        })
}

export async function redDeleteUpload(fileId: string): Promise<UploadInfo[] | null> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') return null

    const url = new URL(process.env.REDREPORT_URL + '/api/kc/uploads/' + fileId)
    url.searchParams.append('site_id', process.env.SITE_ID || '')

    const options: RequestInit = {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + session?.token,
        }
    }

    return fetch(url.toString(), options)
        .then(async (res: Response) => {
            console.log('redDeleteUpload: ', res.status)
            if (!res.ok) {
                const errorData = await res.json()
                console.log('redDeleteUpload error response: ', errorData)
                return null
            }
            return res.json()
        })
        .then(async (data) => {
            return data.data.uploads
        })
        .catch((err) => {
            console.log('redDeleteUpload error: ', err.message)
            return null
        })
}

export async function redRenameFile(fileId: string, name: string): Promise<UploadInfo[] | null> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') return null

    const url = new URL(process.env.REDREPORT_URL + '/api/kc/uploads/' + fileId)
    url.searchParams.append('site_id', process.env.SITE_ID || '')

    const options: RequestInit = {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + session?.token,
        },
        body: JSON.stringify({
            name: name
        })
    }

    return fetch(url.toString(), options)
        .then(async (res: Response) => {
            console.log('redRenameFile: ', res.status)
            if (!res.ok) {
                const errorData = await res.json()
                console.log('redRenameFile error response: ', errorData)
                return null
            }
            return res.json()
        })
        .then(async (data) => {
            return data.data.uploads
        })
        .catch((err) => {
            console.log('redRenameFile error: ', err.message)
            return null
        })
}
