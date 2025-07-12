'use client'
import UploadsList from '@/components/UploadsList'
import {UploadInfo} from '@/types/UploadInfo'
import {useEffect, useRef, useState} from 'react'
import {useClientStore} from '@/stores/useClientStore'

export default function UploadsPage() {
    const [localUploads, setLocalUploads] = useState<UploadInfo[] | null>(null)
    const {getUploads, fetchUploads} = useClientStore()
    const uploads = getUploads()
    const backgroundFetchDone = useRef(false)

    // Set data from the store immediately if available
    useEffect(() => {
        if (uploads && uploads.length > 0) {
            setLocalUploads(uploads)
        }

        // Only fetch once when the component mounts
        if (!backgroundFetchDone.current) {
            backgroundFetchDone.current = true
            console.log('UploadsPage: Fetching uploads in background')
            fetchUploads()
                .then((fetchedUploads) => {
                    if (fetchedUploads) {
                        setLocalUploads(fetchedUploads)
                    }
                })
        }
    }, [fetchUploads, uploads])

    return (
        <UploadsList
            options={localUploads}
        />
    )
}
