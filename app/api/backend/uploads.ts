'use server'
import { getAuthenticatedSession } from '@/lib/auth-server'
import { UploadInfo } from '@/types/UploadInfo'
import { dataSource } from '@/lib/data-source'

export async function redGetMyUploads(): Promise<UploadInfo[] | null> {
    const session = await getAuthenticatedSession()
    if (!session) return null

    return dataSource.getUploads()
}

export async function redUploadFile(file: File): Promise<UploadInfo[] | null> {
    const session = await getAuthenticatedSession()
    if (!session) return null

    const result = await dataSource.uploadFile(file, 'document')
    if (result.error) return null

    // Return all uploads after adding the new one
    return dataSource.getUploads()
}

export async function redDeleteUpload(fileId: string): Promise<UploadInfo[] | null> {
    const session = await getAuthenticatedSession()
    if (!session) return null

    const result = await dataSource.deleteUpload(fileId)
    return result.data
}

export async function redRenameFile(fileId: string, name: string): Promise<UploadInfo[] | null> {
    const session = await getAuthenticatedSession()
    if (!session) return null

    // TODO: Implement rename in data source when available
    console.log('redRenameFile: Rename not yet implemented', { fileId, name })
    return dataSource.getUploads()
}
