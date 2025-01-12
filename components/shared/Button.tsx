'use client'
import React, {FC, SVGProps} from 'react'

const fixedLineButtonClass = 'flex relative w-fit h-fit cursor-pointer transition-all ease-in-out ' +
    'before:transition-[width] before:ease-in-out before:duration-300 before:absolute ' +
    'before:bg-black dark:before:bg-white ' +
    'before:origin-center before:h-[1px] before:w-0 hover:before:w-[50%] before:bottom-0 before:left-[50%] ' +
    'after:transition-[width] after:ease-in-out after:duration-300 after:absolute ' +
    'after:bg-black dark:after:bg-white ' +
    'after:origin-center after:h-[1px] after:w-0 hover:after:w-[50%] after:bottom-0 after:right-[50%] ' +
    'text-slate-800 dark:text-slate-300 ' +
    'hover:text-slate-950 dark:hover:text-slate-100 antialiased hover:subpixel-antialiased ' +
    'px-1 pt-2 '
const disabledLineButtonClass = 'before:transition-0 before:duration-0 after:transition-0 after:duration-0 ' +
    'before:bg-transparent dark:before:bg-transparent before:h-0 before:w-0 after:bg-transparent dark:after:bg-transparent after:h-0 after:w-0 ' +
    'hover:before:w-0 hover:after:w-0 hover:before:h-0 hover:after:h-0 ' +
    'text-slate-400 dark:text-slate-500 hover:text-slate-300 dark:hover:text-slate-600'

const fixedButtonClass = 'flex w-fit h-fit cursor-pointer rounded-md px-3 py-1 text-sm transition-colors ' +
    'text-neutral-100 bg-orange-500 bg-opacity-80 hover:bg-orange-500 hover:bg-opacity-100 active:bg-orange-600 active:bg-opacity-100 ' +
    'dark:text-indigo-950 dark:bg-cyan-100 dark:bg-opacity-80 dark:hover:bg-cyan-50 dark:hover:bg-opacity-100 dark:active:bg-white dark:active:bg-opacity-100 '
const disabledButtonClass = 'flex w-fit h-fit cursor-pointer rounded-md px-3 py-1 text-sm transition-colors ' +
    'text-neutral-100 bg-orange-500 bg-opacity-80 hover:bg-orange-500 hover:bg-opacity-100 active:bg-orange-600 active:bg-opacity-100 ' +
    'dark:text-indigo-950 dark:bg-cyan-100 dark:bg-opacity-80 dark:hover:bg-cyan-50 dark:hover:bg-opacity-100 dark:active:bg-white dark:active:bg-opacity-100 '

export default function Button({
                                   type = 'button',
                                   className = '',
                                   onClick,
                                   disabled = false,
                                   style = 'line',
                                   icon,
                                   children
                               }: {
    type: 'button' | 'submit' | 'reset' | undefined
    className?: string
    onClick?: () => void
    disabled?: boolean
    style?: string
    icon?: FC<SVGProps<SVGSVGElement>>
    loading?: boolean
    children?: React.ReactNode
}) {
    return (
        <button
            type={type}
            className={style === 'line' ?
                fixedLineButtonClass + className + (disabled ? disabledLineButtonClass : '') :
                fixedButtonClass + className + (disabled ? disabledButtonClass : '')
            }
            onClick={onClick}
            disabled={disabled}
        >
            <span className="flex flex-row group-active:[transform:translate3d(0,1px,0)] whitespace-nowrap">
                {icon ? //TODO make it rotating on positive loading
                    <div className="mt-0.5 mr-1">
                        {React.createElement(icon)}
                    </div> :
                    ''}
                <div>{children}</div>
            </span>
        </button>
    )
}