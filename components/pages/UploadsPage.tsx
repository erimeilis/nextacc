'use client'
import UploadsList from '@/components/UploadsList'
import {UploadInfo} from '@/types/UploadInfo'
import {useEffect, useState} from 'react'
import {useClientStore} from '@/stores/useClientStore'

export default function UploadsPage() {
    const [localUploads, setLocalUploads] = useState<UploadInfo[] | null>([])
    const {getUploads, updateUploads} = useClientStore()
    const uploads = getUploads()

    // Set data from the store immediately if available
    useEffect(() => {
        if (uploads) {
            setLocalUploads(uploads)
        }
    }, [uploads])

    // Fetch data in the background if not available
    useEffect(() => {
        if (!uploads) {
            updateUploads()
                .then((fetchedUploads) => {
                    setLocalUploads(fetchedUploads)
                })
        }
    }, [uploads, updateUploads])

    return (
        <UploadsList
            options={localUploads}
        />
    )
}
