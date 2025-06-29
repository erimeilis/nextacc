'use client'
import MyNumbersList from '@/components/MyNumbersList'
import MyWaitingNumbersList from '@/components/MyWaitingNumbersList'
import {NumberInfo} from '@/types/NumberInfo'
import {MyWaitingNumberInfo} from '@/types/MyWaitingNumberInfo'
import {useEffect, useRef, useState} from 'react'
import {useClientStore} from '@/stores/useClientStore'
import {Switch} from '@/components/ui/Switch'
import {useTranslations} from 'next-intl'
import {redGetMyWaitingDids} from '@/app/api/redreport/waiting-dids'

export default function NumbersPage() {
    const t = useTranslations('dashboard')
    const [localNumbers, setLocalNumbers] = useState<NumberInfo[] | null>([])
    const [waitingNumbers, setWaitingNumbers] = useState<MyWaitingNumberInfo[] | null>(null)
    const [showWaiting, setShowWaiting] = useState<boolean>(false)
    const {getNumbers, updateNumbers} = useClientStore()
    const numbers = getNumbers()
    const backgroundFetchDone = useRef(false)
    const waitingBackgroundFetchDone = useRef(false)

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
            // Set to null to show skeleton loader while fetching
            if (waitingNumbers && waitingNumbers.length === 0) {
                setWaitingNumbers(null)
            }

            if (!waitingBackgroundFetchDone.current) {
                waitingBackgroundFetchDone.current = true
                console.log('Fetching waiting numbers')

                // Fetch waiting numbers using redGetMyWaitingDids
                redGetMyWaitingDids()
                    .then(data => {
                        if (data) {
                            setWaitingNumbers(data)
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching waiting numbers:', error)
                    })
            }
        } else if (!showWaiting) {
            // Reset the flag when switching back to active numbers
            waitingBackgroundFetchDone.current = false
        }
    }, [showWaiting, waitingNumbers])

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
                <MyWaitingNumbersList options={waitingNumbers}/>
            ) : (
                <MyNumbersList options={localNumbers}/>
            )}
        </div>
    )
}
