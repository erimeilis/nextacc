'use client'
import React, {FC, SVGProps} from 'react'

const fixedTabClass = 'w-full flex items-center justify-center rounded-t-md px-2 py-4 sm:p-4 text-sm sm:text-sm font-medium first:ml-0 focus:outline-none focus:ring-none cursor-pointer ' +
    'border-border dark:border-border transition-all duration-200 '
const commonClass = 'shadow-inner shadow-sm border-b border-r last:border-r-0 border-border ' +
    'bg-muted hover:bg-accent text-muted-foreground hover:text-foreground ' +
    'dark:bg-muted dark:text-muted-foreground dark:border-border dark:hover:bg-accent dark:hover:text-foreground '
const activeTabClass = 'shadow-none border-b-0 ' +
    'bg-gradient-to-br from-secondary to-background hover:bg-gradient-to-br hover:from-secondary hover:to-background text-foreground ' +
    'dark:bg-gradient-to-br dark:from-secondary dark:to-background dark:text-foreground dark:hover:bg-gradient-to-br dark:hover:from-secondary dark:hover:to-background'

export default function Tab({
                                type = 'button',
                                className = '',
                                onClick,
                                active = false,
                                isLoading = false,
                                icon,
                                iconSize = 'h-4 w-4',
                                children
                            }: {
    type: 'button' | 'submit' | 'reset' | undefined
    className?: string
    onClick?: () => void
    active?: boolean
    isLoading?: boolean
    icon?: FC<SVGProps<SVGSVGElement>>
    iconSize?: string
    children?: React.ReactNode
}) {
    // Disable clicking when active tab is loading (showing skeleton)
    const isClickDisabled = active && isLoading

    const handleClick = () => {
        if (!isClickDisabled && onClick) {
            onClick()
        }
    }

    return (
        <button
            type={type}
            className={fixedTabClass + ' ' + className + ' ' + (active ? activeTabClass : commonClass) + (isClickDisabled ? ' cursor-not-allowed opacity-75' : '')}
            onClick={handleClick}
        >
            <div className="relative flex items-center justify-center px-2 sm:px-4">
                {isLoading && active && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-t-transparent border-foreground rounded-full animate-spin"></div>
                    </div>
                )}
                <div className={`${isLoading && active ? 'opacity-0' : ''} flex items-center`}>
                    {icon && <span className="mr-2 hidden sm:inline-block">{React.createElement(icon, {className: iconSize})}</span>}
                    {children}
                </div>
            </div>
        </button>
    )
}
