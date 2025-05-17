'use client'
import MyNumbersList from '@/components/MyNumbersList'
import {NumberInfo} from '@/types/NumberInfo'
import {useEffect, useState} from 'react'
import {useClientStore} from '@/stores/useClientStore'

export default function NumbersPage() {
    const [numbersState, setNumbersState] = useState<NumberInfo[] | null>(null)
    const {numbers, updateNumbers} = useClientStore()
    useEffect(() => {
        if (!numbers) {
            updateNumbers()
        }
    }, [numbers, updateNumbers])

    useEffect(() => {
        setNumbersState(numbers)
    }, [numbers])

    return (
        <MyNumbersList
            options={numbersState}
        />
    )
}