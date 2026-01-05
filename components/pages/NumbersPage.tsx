'use client'

import MyNumbersList from '@/components/MyNumbersList'
import MyWaitingNumbersList from '@/components/MyWaitingNumbersList'
import { useState } from 'react'
import { useDids } from '@/hooks/queries/use-dids'
import { useWaitingDids } from '@/hooks/queries/use-waiting-dids'
import { Switch } from '@/components/ui/Switch'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function NumbersPage() {
    const t = useTranslations('dashboard')
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [showWaiting, setShowWaiting] = useState<boolean>(pathname?.includes('/waiting-numbers') || false)

    // Fetch both datasets with TanStack Query
    const { data: numbers, isLoading: numbersLoading, error: numbersError } = useDids()
    const { data: waitingNumbers, isLoading: waitingLoading, error: waitingError } = useWaitingDids()

    // Handle switch change
    const handleSwitchChange = (checked: boolean) => {
        setShowWaiting(checked)

        if (!pathname) return

        if (checked) {
            const newPath = pathname.replace('/numbers', '/waiting-numbers')
            router.push(newPath + (searchParams?.toString() ? '?' + searchParams.toString() : ''))
        } else {
            const newPath = pathname.replace('/waiting-numbers', '/numbers')
            router.push(newPath + (searchParams?.toString() ? '?' + searchParams.toString() : ''))
        }
    }

    // Error handling
    if (showWaiting && waitingError) {
        return (
            <div className="text-center py-8 text-destructive">
                <p>Failed to load waiting numbers: {waitingError.message}</p>
            </div>
        )
    }

    if (!showWaiting && numbersError) {
        return (
            <div className="text-center py-8 text-destructive">
                <p>Failed to load numbers: {numbersError.message}</p>
            </div>
        )
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
                    options={waitingLoading ? null : (waitingNumbers ?? null)}
                />
            ) : (
                <MyNumbersList
                    options={numbersLoading ? null : (numbers ?? null)}
                />
            )}
        </>
    )
}
