'use client'
import MyNumbersList from '@/components/MyNumbersList'
import {NumberInfo} from '@/types/NumberInfo'
import {useEffect, useState} from 'react'
import {useClientStore} from '@/stores/useClientStore'

export default function NumbersPage() {
    const [localNumbers, setLocalNumbers] = useState<NumberInfo[] | null>([])
    const {numbers, updateNumbers} = useClientStore()

    // Set data from store immediately if available
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

    return (
        <MyNumbersList
            options={localNumbers}
        />
    )
}
