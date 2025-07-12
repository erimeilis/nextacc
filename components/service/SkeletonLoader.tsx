'use client'
import React from 'react'
import {usePathname} from 'next/navigation'

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
            {currentTab === 'profile' && <ProfileSkeleton/>}
            {currentTab === 'transactions' && <TransactionsSkeleton/>}
            {currentTab === 'numbers' && <NumbersSkeleton/>}
            {currentTab === 'uploads' && <UploadsSkeleton/>}
        </div>
    )
}

export function ProfileSkeleton() {
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

            {/* Profile form */}
            <div className="flex items-center justify-between pt-2">
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <div className="flex flex-col w-full">
                        {/* Table skeleton */}
                        <div className="space-y-1">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`flex flex-row w-full py-2 px-2 ${i % 2 !== 0 ? 'bg-secondary/50 dark:bg-secondary/40' : ''}`}
                                >
                                    <div className="min-w-24 w-24 sm:min-w-32 sm:w-32 text-muted-foreground font-light">
                                        <div className="h-4 bg-muted rounded w-full"></div>
                                    </div>
                                    <div className="flex-grow text-right sm:text-left">
                                        <div className="h-4 bg-muted rounded w-3/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-row sm:flex-col justify-center sm:justify-end mt-4 sm:mt-0 sm:min-w-36">
                        <div className="h-8 bg-muted rounded w-24"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function TransactionsSkeleton() {
    return (
        <div className="space-y-4">
            {/* Filters section */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/20 rounded-lg">
                <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-full"></div>
                </div>
                <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-16 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-full"></div>
                </div>
                <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-full"></div>
                </div>
            </div>

            {/* DataTable header */}
            <div className="overflow-x-auto">
                <div className="min-w-full">
                    <div className="flex w-full py-3 border-b border-border bg-muted/10">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex-1 px-4">
                                <div className="h-5 bg-muted rounded"></div>
                            </div>
                        ))}
                    </div>

                    {/* DataTable rows */}
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex w-full py-3 border-b border-border hover:bg-muted/5">
                            {[...Array(5)].map((_, j) => (
                                <div key={j} className="flex-1 px-4">
                                    <div className="h-4 bg-muted rounded"></div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* DataTable pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                <div className="flex items-center gap-2">
                    <div className="h-4 bg-muted rounded w-16"></div>
                    <div className="h-8 bg-muted rounded w-16"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-8 bg-muted rounded w-20"></div>
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-8 bg-muted rounded w-8"></div>
                        ))}
                    </div>
                    <div className="h-8 bg-muted rounded w-20"></div>
                </div>
            </div>
        </div>
    )
}

function NumbersSkeleton() {
    return (
        <div className="flex flex-col w-full">
            {/* Total section */}
            <div className="flex flex-col sm:flex-row justify-between py-2 px-3 bg-muted/30 border-b border-border mb-2">
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="h-4 bg-muted rounded w-40"></div>
            </div>

            {/* Header with search */}
            <div className="flex flex-col sm:flex-row items-center p-2 border-b border-border mb-1 gap-2">
                <div className="flex items-center flex-1">
                    <div className="relative w-full sm:max-w-xs">
                        <div className="h-8 bg-muted rounded w-full"></div>
                    </div>
                </div>
            </div>

            {/* Number list table */}
            <div className="overflow-x-auto">
                <div className="space-y-1">
                    {[...Array(5)].map((_, i) => (
                        <div key={i}>
                            {/* Main row */}
                            <div className={`flex flex-row items-center w-full py-1 px-2 ${i % 2 !== 0 ? 'bg-secondary/50 dark:bg-secondary/40' : ''}`}>
                                {/* Checkbox */}
                                <div className="w-8">
                                    <div className="h-4 bg-muted rounded w-4"></div>
                                </div>

                                {/* Number and name */}
                                <div className="flex-1">
                                    <div className="flex flex-col">
                                        <div className="h-4 bg-muted rounded w-32 mb-1"></div>
                                        <div className="h-3 bg-muted rounded w-24"></div>
                                    </div>
                                </div>

                                {/* Feature icons */}
                                <div className="w-20">
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="h-4 bg-muted rounded w-4"></div>
                                        <div className="h-4 bg-muted rounded w-4"></div>
                                        <div className="h-4 bg-muted rounded w-4"></div>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="w-28">
                                    <div className="flex items-center justify-end space-x-1">
                                        {[...Array(4)].map((_, j) => (
                                            <div key={j} className="h-7 bg-muted rounded w-7"></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-2 border-t border-border mt-2 gap-2">
                <div className="flex items-center gap-2">
                    <div className="h-4 bg-muted rounded w-4"></div>
                    <div className="h-4 bg-muted rounded w-20"></div>
                </div>
                <div className="h-8 bg-muted rounded w-32"></div>
            </div>
        </div>
    )
}

function UploadsSkeleton() {
    return (
        <div className="space-y-4">
            {/* Total section */}
            <div className="flex flex-col sm:flex-row justify-between py-2 px-3 bg-muted/30 border-b border-border mb-2">
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="h-4 bg-muted rounded w-40"></div>
            </div>

            {/* Header with search and upload */}
            <div className="flex flex-col sm:flex-row items-center p-2 border-b border-border mb-1 gap-2">
                <div className="flex items-center flex-1">
                    <div className="h-8 bg-muted rounded w-full sm:w-64"></div>
                </div>
                <div className="h-8 bg-muted rounded w-24"></div>
            </div>

            {/* Upload list */}
            <div className="overflow-x-auto">
                <div className="space-y-1">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={`flex flex-row items-center w-full py-2 px-2 gap-2 ${i % 2 !== 0 ? 'bg-secondary/50 dark:bg-secondary/40' : ''}`}>
                            {/* Checkbox */}
                            <div className="w-8">
                                <div className="h-4 bg-muted rounded w-4"></div>
                            </div>

                            {/* File icon and info */}
                            <div className="flex items-center flex-1 gap-2">
                                <div className="h-8 bg-muted rounded w-8"></div>
                                <div className="flex flex-col flex-1 gap-1">
                                    <div className="h-4 bg-muted rounded w-48"></div>
                                    <div className="h-3 bg-muted rounded w-24"></div>
                                </div>
                            </div>

                            {/* File size */}
                            <div className="w-20">
                                <div className="h-4 bg-muted rounded w-16"></div>
                            </div>

                            {/* Date */}
                            <div className="w-24">
                                <div className="h-4 bg-muted rounded w-20"></div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center justify-end space-x-1 w-20">
                                {[...Array(3)].map((_, j) => (
                                    <div key={j} className="h-6 bg-muted rounded w-6"></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-2 border-t border-border mt-2 gap-2">
                <div className="flex items-center gap-2">
                    <div className="h-4 bg-muted rounded w-4"></div>
                    <div className="h-4 bg-muted rounded w-20"></div>
                </div>
                <div className="h-8 bg-muted rounded w-32"></div>
            </div>
        </div>
    )
}
