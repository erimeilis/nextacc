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
      }}
    >
      {children}
    </SWRConfig>
  )
}