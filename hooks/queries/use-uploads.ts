'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUploads, uploadFile, deleteUpload, renameFile } from '@/lib/api'

export const uploadsKeys = {
    all: ['uploads'] as const,
    list: () => [...uploadsKeys.all, 'list'] as const,
}

/**
 * useUploads - Fetch user uploaded documents
 */
export function useUploads() {
    return useQuery({
        queryKey: uploadsKeys.list(),
        queryFn: async () => {
            const result = await getUploads()
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
    })
}

/**
 * useUploadFile - Upload a new document
 */
export function useUploadFile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ file, type }: { file: File; type: string }) => {
            const result = await uploadFile(file, type)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: uploadsKeys.all })
        },
    })
}

/**
 * useDeleteUpload - Delete an uploaded document
 */
export function useDeleteUpload() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (filename: string) => {
            const result = await deleteUpload(filename)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: uploadsKeys.all })
        },
    })
}

/**
 * useRenameFile - Rename an uploaded document
 */
export function useRenameFile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ filename, newName }: { filename: string; newName: string }) => {
            const result = await renameFile(filename, newName)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: uploadsKeys.all })
        },
    })
}
