'use client'
import { SWRConfig } from 'swr'
import React from 'react'

export default function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateIfStale: true,
        revalidateOnReconnect: true,
        dedupingInterval: 60000, // Dedupe requests within 1 minute
        focusThrottleInterval: 10000, // Only revalidate once per 10 seconds during rapid focus events
        loadingTimeout: 3000, // Show loading state after 3 seconds
        errorRetryCount: 3, // Retry failed requests 3 times
        errorRetryInterval: 5000, // Wait 5 seconds between retries
      }}
    >
      {children}
    </SWRConfig>
  )
}
