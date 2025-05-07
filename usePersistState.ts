'use client'
import {useEffect, useMemo, useState} from 'react'

export default function usePersistState<T>(initial_value: T, id: string): [T, (new_state: T) => void] {
// Set initial value
    const _initial_value = useMemo(() => {
        // If there is a value stored in localStorage, use that
        if (typeof localStorage !== 'undefined') {
            try {
                const local_storage_value_str = localStorage.getItem('state:' + id)
                if (local_storage_value_str !== null) {
                    return JSON.parse(local_storage_value_str)
                }
            } catch (error) {
                console.error('Error parsing state from localStorage:', error)
            }
        }
        // Otherwise, use initial_value that was passed to the function
        return initial_value
    }, [id, initial_value])

    const [state, setState] = useState(_initial_value)
    useEffect(() => {
        const state_str = JSON.stringify(state) // Stringified state
        localStorage.setItem('state:' + id, state_str) // Set stringified state as item in localStorage
    }, [id, state])
    return [state, setState]
}

export function getPersistState<T>(id: string, defaultValue: T): T {
    // Check if we're in a browser environment
    if (typeof localStorage !== 'undefined') {
        try {
            const storedValue = localStorage.getItem('state:' + id)
            // If a value exists in localStorage, parse and return it
            if (storedValue !== null) {
                return JSON.parse(storedValue) as T
            }
        } catch (error) {
            console.error('Error retrieving state from localStorage:', error)
        }
    }
    // Return the default value if no value in localStorage or if we're not in a browser
    return defaultValue
}
