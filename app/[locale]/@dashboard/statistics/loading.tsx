'use server'
import Loader from '@/components/service/Loader'
import React from 'react'

export default async function Loading() {
    // You can add any UI inside Loading, including a Skeleton.
    return <Loader height={50}/>
}
