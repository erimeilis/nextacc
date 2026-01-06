'use client'

import UploadsList from '@/components/uploads/UploadsList'
import { useUploads } from '@/hooks/queries/use-uploads'

export default function UploadsPage() {
    const { data: uploads, isLoading, error } = useUploads()

    if (error) {
        return (
            <div className="text-center py-8 text-destructive">
                <p>Failed to load uploads: {error.message}</p>
            </div>
        )
    }

    return (
        <UploadsList
            options={isLoading ? null : (uploads ?? null)}
        />
    )
}
