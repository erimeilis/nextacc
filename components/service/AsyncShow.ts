'use client'
import React, {useEffect, useState} from 'react'

export default function AsyncShow({
                                      when,
                                      fallback,
                                      children
                                  }: {
    when: boolean
    fallback?: React.ReactNode
    children: React.ReactNode
}): React.ReactNode {
    const [isLoading, setIsLoading] = useState(true)
    const [data, setData] = useState<boolean | null>(null)

    useEffect(() => {
        Promise
            .resolve(when)
            .then(result => {
                setData(result)
                setIsLoading(false)
            })
    }, [when])

    if (isLoading) return fallback
    return data ? children : null
}