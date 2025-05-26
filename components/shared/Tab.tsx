'use client'
import React, {FC, SVGProps} from 'react'

const fixedTabClass = 'w-full flex items-center justify-center rounded-t-md px-2 py-4 sm:p-4 text-sm sm:text-sm font-medium first:ml-0 focus:outline-none focus:ring-none ' +
    'border-border dark:border-border '
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
                                icon,
                                children
                            }: {
    type: 'button' | 'submit' | 'reset' | undefined
    className?: string
    onClick?: () => void
    active?: boolean
    icon?: FC<SVGProps<SVGSVGElement>>
    children?: React.ReactNode
}) {
    return (
        <button
            type={type}
            className={fixedTabClass + ' ' + className + ' ' + (active ? activeTabClass : commonClass)}
            onClick={onClick}
        >
            {icon ?
                <div className="mr-2">
                    {React.createElement(icon)}
                </div> :
                ''}{children}
        </button>
    )
}
