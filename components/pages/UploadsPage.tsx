'use client'
import UploadsList from '@/components/UploadsList'
import {UploadInfo} from '@/types/UploadInfo'
import {useEffect, useRef, useState} from 'react'
import {useClientStore} from '@/stores/useClientStore'

export default function UploadsPage() {
    const [localUploads, setLocalUploads] = useState<UploadInfo[] | null>([])
    const {getUploads, fetchUploads} = useClientStore()
    const uploads = getUploads()
    const backgroundFetchDone = useRef(false)

    // Set data from the store immediately if available
    useEffect(() => {
        if (uploads && uploads.length > 0) {
            setLocalUploads(uploads)
        }
        if (!uploads || uploads.length == 0 || !backgroundFetchDone.current) {
            backgroundFetchDone.current = true
            fetchUploads()
                .then((fetchedUploads) => {
                    setLocalUploads(fetchedUploads)
                })
        }
    }, [fetchUploads, uploads])

    return (
        <UploadsList
            options={localUploads}
        />
    )
}
