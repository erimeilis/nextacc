'use client'
import MyNumbersList from '@/components/MyNumbersList'
import MyWaitingNumbersList from '@/components/MyWaitingNumbersList'
import {NumberInfo} from '@/types/NumberInfo'
import {useEffect, useRef, useState} from 'react'
import {useClientStore} from '@/stores/useClientStore'
import {Switch} from '@/components/ui/Switch'
import {useTranslations} from 'next-intl'
import {useSearchParams} from 'next/navigation'
import {useWaitingDidsStore} from '@/stores/useWaitingDidsStore'

export default function NumbersPage() {
    const t = useTranslations('dashboard')
    const searchParams = useSearchParams()
    const [localNumbers, setLocalNumbers] = useState<NumberInfo[] | null>([])
    const [showWaiting, setShowWaiting] = useState<boolean>(searchParams?.get('tab') === 'waiting')
    const {getNumbers, updateNumbers} = useClientStore()
    const {waitingDids, fetchData: fetchWaitingDids, isLoading: isLoadingWaitingDids} = useWaitingDidsStore()
    const numbers = getNumbers()
    const backgroundFetchDone = useRef(false)

    // Set data from the store immediately if available
    useEffect(() => {
        if (numbers) {
            setLocalNumbers(numbers)
        }
    }, [numbers])

    // Fetch data in the background if not available
    useEffect(() => {
        if (!numbers) {
            console.log('Fetching numbers because they are not available')
            updateNumbers()
                .then((fetchedNumbers) => {
                    setLocalNumbers(fetchedNumbers)
                })
        }
    }, [numbers, updateNumbers])

    // Fetch data in the background even when it exists, but only once per-page visit
    useEffect(() => {
        if (numbers && !backgroundFetchDone.current) {
            backgroundFetchDone.current = true
            console.log('Fetching numbers in the background')
            updateNumbers()
                .then((fetchedNumbers) => {
                    setLocalNumbers(fetchedNumbers)
                })
        }
    }, [numbers, updateNumbers])

    // Fetch waiting numbers
    useEffect(() => {
        if (showWaiting) {
            console.log('Fetching waiting numbers')
            // Fetch waiting numbers using the store
            fetchWaitingDids()
                .catch(error => {
                    console.error('Error fetching waiting numbers:', error)
                })
        }
    }, [showWaiting, fetchWaitingDids])

    return (
        <div className="flex flex-col w-full">
            <div className="flex items-center space-x-2 mb-4">
                <div className={showWaiting ? 'text-muted-foreground' : 'font-medium'}>{t('active')}</div>
                <Switch
                    checked={showWaiting}
                    onCheckedChange={setShowWaiting}
                />
                <div className={showWaiting ? 'font-medium' : 'text-muted-foreground'}>{t('waiting')}</div>
            </div>

            {showWaiting ? (
                <MyWaitingNumbersList options={isLoadingWaitingDids ? null : waitingDids}/>
            ) : (
                <MyNumbersList options={localNumbers}/>
            )}
        </div>
    )
}
