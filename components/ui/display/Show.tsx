'use client'
import React from 'react'

export default function Show({
                                 when,
                                 fallback = null,
                                 children
                             }: {
    when: boolean
    fallback?: React.ReactNode
    children: React.ReactNode
}): React.ReactNode {
    return when ? children : fallback
}