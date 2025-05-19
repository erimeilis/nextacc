'use client'
import MyNumbersList from '@/components/MyNumbersList'
import {NumberInfo} from '@/types/NumberInfo'
import {useEffect, useState} from 'react'
import {useClientStore} from '@/stores/useClientStore'

export default function NumbersPage() {
    const [localNumbers, setLocalNumbers] = useState<NumberInfo[] | null>(null)
    const {numbers, updateNumbers} = useClientStore()
    useEffect(() => {
        if (numbers) {
            setLocalNumbers(numbers)
        } else {
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