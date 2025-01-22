'use server'
import React from 'react'
import Loader from '@/components/service/Loader'

export default async function Loading() {
    // You can add any UI inside Loading, including a Skeleton.
    return <Loader height={50}/>
}