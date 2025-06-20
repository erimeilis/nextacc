'use client'
import MyNumbersList from '@/components/MyNumbersList'
import {NumberInfo} from '@/types/NumberInfo'
import {useEffect, useRef, useState} from 'react'
import {useClientStore} from '@/stores/useClientStore'

export default function NumbersPage() {
    const [localNumbers, setLocalNumbers] = useState<NumberInfo[] | null>([])
    const {getNumbers, updateNumbers} = useClientStore()
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
            updateNumbers()
                .then((fetchedNumbers) => {
                    setLocalNumbers(fetchedNumbers)
                })
        }
    }, [numbers, updateNumbers])

    return (
        <MyNumbersList
            options={localNumbers}
        />
    )
}
