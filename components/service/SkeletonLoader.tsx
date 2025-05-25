'use client'
import React from 'react'
import { usePathname } from 'next/navigation'

export default function SkeletonLoader() {
  const pathname = usePathname()
  
  // Determine which skeleton to show based on the current path
  const getCurrentTab = () => {
    if (!pathname) {
      return 'profile'
    } else {
      const segments = pathname.split('/')
      return segments[2] ? segments[2] : 'profile'
    }
  }
  
  const currentTab = getCurrentTab()
  
  return (
    <div className="w-full animate-pulse">
      {currentTab === 'profile' && <ProfileSkeleton />}
      {currentTab === 'transactions' && <TransactionsSkeleton />}
      {currentTab === 'numbers' && <NumbersSkeleton />}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header with user info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 pb-4 border-b border-border dark:border-border drop-shadow-sm">
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="flex flex-row gap-2">
          <div className="h-8 bg-muted rounded w-24"></div>
          <div className="h-8 bg-muted rounded w-24"></div>
        </div>
      </div>
      
      {/* Profile fields */}
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className={`flex flex-row w-full ${i % 2 !== 0 ? 'bg-secondary/50 dark:bg-secondary/40' : ''}`}
          >
            <div className="flex p-2 items-center min-w-24 w-24 sm:min-w-32 sm:w-32">
              <div className="h-4 bg-muted rounded w-full"></div>
            </div>
            <div className="flex-grow p-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TransactionsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Table header */}
      <div className="flex w-full py-2 border-b border-border">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-1 px-2">
            <div className="h-5 bg-muted rounded"></div>
          </div>
        ))}
      </div>
      
      {/* Table rows */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex w-full py-2 border-b border-border">
          {[...Array(5)].map((_, j) => (
            <div key={j} className="flex-1 px-2">
              <div className="h-4 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      ))}
      
      {/* Pagination */}
      <div className="flex justify-between items-center pt-2">
        <div className="h-4 bg-muted rounded w-24"></div>
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 bg-muted rounded w-8"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NumbersSkeleton() {
  return (
    <div className="space-y-4">
      {/* Total section */}
      <div className="flex flex-col sm:flex-row justify-between py-2 px-3 bg-muted/30 border-b border-border mb-2">
        <div className="h-4 bg-muted rounded w-32"></div>
        <div className="h-4 bg-muted rounded w-40"></div>
      </div>
      
      {/* Search bar */}
      <div className="flex items-center p-2 border-b border-border mb-1">
        <div className="h-8 bg-muted rounded w-full sm:w-64"></div>
      </div>
      
      {/* Number list */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className={`flex flex-row items-center w-full py-2 px-2 gap-2 ${i % 2 !== 0 ? 'bg-secondary/50 dark:bg-secondary/40' : ''}`}>
          {/* Checkbox */}
          <div className="w-8">
            <div className="h-4 bg-muted rounded w-4"></div>
          </div>
          
          {/* Number and name */}
          <div className="flex flex-col flex-1 gap-1">
            <div className="h-4 bg-muted rounded w-32"></div>
            <div className="h-3 bg-muted rounded w-24"></div>
          </div>
          
          {/* Feature icons */}
          <div className="flex items-center justify-center space-x-2 w-20">
            <div className="h-4 bg-muted rounded w-4"></div>
            <div className="h-4 bg-muted rounded w-4"></div>
            <div className="h-4 bg-muted rounded w-4"></div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-1 w-28">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="h-6 bg-muted rounded w-6"></div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-2 border-t border-border mt-2 gap-2">
        <div className="flex items-center gap-2">
          <div className="h-4 bg-muted rounded w-4"></div>
          <div className="h-4 bg-muted rounded w-20"></div>
        </div>
      </div>
    </div>
  )
}