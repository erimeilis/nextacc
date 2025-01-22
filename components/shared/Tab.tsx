'use client'
import React, {FC, SVGProps} from 'react'

const fixedTabClass = 'w-full flex items-center justify-center rounded-t-md p-4 text-sm font-medium first:ml-0 focus:outline-none focus:ring-none ' +
    'border-gray-200 dark:border-indigo-600 '
const commonClass = 'shadow-inner shadow-sm border-b border-r last:border-r-0 border-gray-300 ' +
    'bg-gray-200 hover:bg-orange-100 text-gray-500 hover:text-gray-700 ' +
    'dark:bg-indigo-900 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-800 dark:hover:text-white '
const activeTabClass = 'shadow-none border-b-0 ' +
    'bg-gray-100 hover:bg-gray-100 text-gray-900 ' +
    'dark:bg-indigo-950 dark:text-white dark:hover:bg-indigo-950 dark:hover:text-white'

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
            className={fixedTabClass + className + (active ? activeTabClass : commonClass)}
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