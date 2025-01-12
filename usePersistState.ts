'use client'
import {useEffect, useMemo, useState} from 'react'

export default function usePersistState<T>(initial_value: T, id: string): [T, (new_state: T) => void] {
// Set initial value
    const _initial_value = useMemo(() => {
        // If there is a value stored in localStorage, use that
        if (typeof localStorage !== 'undefined') {
            const local_storage_value_str = localStorage.getItem('state:' + id)
            return JSON.parse(<string>local_storage_value_str)
        }
        // Otherwise use initial_value that was passed to the function
        return initial_value
    }, [])

    const [state, setState] = useState(_initial_value)
    useEffect(() => {
        const state_str = JSON.stringify(state) // Stringified state
        localStorage.setItem('state:' + id, state_str) // Set stringified state as item in localStorage
    }, [state])
    return [state, setState]
}