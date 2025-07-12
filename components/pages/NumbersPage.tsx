'use client'
import MyNumbersList from '@/components/MyNumbersList'
import MyWaitingNumbersList from '@/components/MyWaitingNumbersList'
import {NumberInfo} from '@/types/NumberInfo'
import {MyWaitingNumberInfo} from '@/types/MyWaitingNumberInfo'
import {useEffect, useRef, useState} from 'react'
import {useClientStore} from '@/stores/useClientStore'
import {Switch} from '@/components/ui/Switch'
import {useTranslations} from 'next-intl'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {useWaitingStore} from '@/stores/useWaitingStore'

export default function NumbersPage() {
    const t = useTranslations('dashboard')
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [localNumbers, setLocalNumbers] = useState<NumberInfo[] | null>(null)
    const [localWaitingNumbers, setLocalWaitingNumbers] = useState<MyWaitingNumberInfo[] | null>(null)
    const [showWaiting, setShowWaiting] = useState<boolean>(pathname?.includes('/waiting-numbers') || false)
    const {getNumbers, fetchNumbers} = useClientStore()
    const {waitingNumbers, fetchWaitingNumbers} = useWaitingStore()
    const numbers = getNumbers()
    const numbersBackgroundFetchDone = useRef(false)
    const waitingNumbersBackgroundFetchDone = useRef(false)


    // Set data from the store immediately if available and fetch in the background if needed
    useEffect(() => {
        if (numbers) {
            setLocalNumbers(numbers)
        }

        // Only fetch once when the component mounts
        if (!numbersBackgroundFetchDone.current) {
            numbersBackgroundFetchDone.current = true
            console.log('NumbersPage: Fetching numbers in background')
            fetchNumbers()
                .then((fetchedNumbers) => {
                    if (fetchedNumbers) {
                        setLocalNumbers(fetchedNumbers)
                    }
                })
        }
    }, [fetchNumbers, numbers])

    // Set waiting data from the store immediately if available and fetch in the background if needed
    useEffect(() => {
        if (waitingNumbers) {
            setLocalWaitingNumbers(waitingNumbers)
        }

        // Only fetch once when the component mounts
        if (!waitingNumbersBackgroundFetchDone.current) {
            waitingNumbersBackgroundFetchDone.current = true
            console.log('NumbersPage: Fetching waiting numbers in background')
            fetchWaitingNumbers()
                .then(() => {
                    if (waitingNumbers) {
                        setLocalWaitingNumbers(waitingNumbers)
                    }
                })
        }
    }, [fetchWaitingNumbers, waitingNumbers])

    // Handle switch change
    const handleSwitchChange = (checked: boolean) => {
        setShowWaiting(checked)

        // Update URL - navigate between numbers and waiting-numbers paths
        if (!pathname) {
            return // Early return if the pathname is null
        }

        if (checked) {
            // Navigate to waiting-numbers
            const newPath = pathname.replace('/numbers', '/waiting-numbers')
            router.push(newPath + (searchParams?.toString() ? '?' + searchParams.toString() : ''))
        } else {
            // Navigate to numbers
            const newPath = pathname.replace('/waiting-numbers', '/numbers')
            router.push(newPath + (searchParams?.toString() ? '?' + searchParams.toString() : ''))
        }
    }

    return (
        <>
            <div className="flex flex-col w-full mb-4">
                <div className="flex items-center space-x-2 text-xs sm:text-sm">
                    <div className={showWaiting ? 'text-muted-foreground' : 'font-medium'}>{t('active')}</div>
                    <Switch
                        checked={showWaiting}
                        onCheckedChange={handleSwitchChange}
                    />
                    <div className={showWaiting ? 'font-medium' : 'text-muted-foreground'}>{t('waiting')}</div>
                </div>
            </div>
            {showWaiting ? (
                <MyWaitingNumbersList
                    options={localWaitingNumbers}
                />
            ) : (
                <MyNumbersList
                    options={localNumbers}
                />
            )}
        </>
    )
}
