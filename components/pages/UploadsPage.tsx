'use client'
import UploadsList from '@/components/UploadsList'
import {UploadInfo} from '@/types/UploadInfo'
import {useEffect, useRef, useState} from 'react'
import {useClientStore} from '@/stores/useClientStore'

export default function UploadsPage() {
    const [localUploads, setLocalUploads] = useState<UploadInfo[] | null>([])
    const {getUploads, updateUploads} = useClientStore()
    const uploads = getUploads()
    const backgroundFetchDone = useRef(false)

    // Set data from the store immediately if available
    useEffect(() => {
        if (uploads) {
            setLocalUploads(uploads)
        }
    }, [uploads])

    // Fetch data in the background if not available
    useEffect(() => {
        if (!uploads) {
            console.log('Fetching uploads because they are not available')
            updateUploads()
                .then((fetchedUploads) => {
                    setLocalUploads(fetchedUploads)
                })
        }
    }, [uploads, updateUploads])

    // Fetch data in the background even when it exists, but only once per-page visit
    useEffect(() => {
        if (uploads && !backgroundFetchDone.current) {
            backgroundFetchDone.current = true
            console.log('Fetching uploads in the background')
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
