'use client'
import React, {FC, SVGProps} from 'react'
import Loader from '@/components/service/Loader'

const fixedLineButtonClass = `
    flex relative w-fit h-fit cursor-pointer transition-all ease-in-out
    before:transition-[width] before:ease-in-out before:duration-300 before:absolute
    before:bg-foreground before:origin-center before:h-[1px] before:w-0 hover:before:w-[50%] before:bottom-0 before:left-[50%]
    after:transition-[width] after:ease-in-out after:duration-300 after:absolute
    after:bg-foreground after:origin-center after:h-[1px] after:w-0 hover:after:w-[50%] after:bottom-0 after:right-[50%]
    text-foreground hover:text-foreground/90 antialiased hover:subpixel-antialiased
    px-3 py-2
`
const disabledLineButtonClass = `
    before:transition-0 before:duration-0 after:transition-0 after:duration-0
    before:bg-transparent before:h-0 before:w-0 after:bg-transparent after:h-0 after:w-0
    hover:before:w-0 hover:after:w-0 hover:before:h-0 hover:after:h-0
    text-muted-foreground hover:text-muted-foreground cursor-not-allowed opacity-50
`

const fixedButtonClass = `
    flex w-fit h-fit cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors
    gradient-button
`
const disabledButtonClass = `
    opacity-50 cursor-not-allowed
`

const pillowButtonClass = `
    flex w-fit h-fit cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors
    gradient-button drop-shadow hover:drop-shadow-lg focus:drop-shadow-lg 
`

export default function ActionButton({
                                         id,
                                         name,
                                         type = 'button',
                                         className = '',
                                         onClick,
                                         disabled = false,
                                         style = 'line',
                                         icon,
                                         loading = false,
                                         children
                                     }: {
    id?: string
    name?: string
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
            id={id}
            name={name}
            type={type}
            className={
                style === 'line'
                    ? `${fixedLineButtonClass} ${className} ${disabled || loading ? disabledLineButtonClass : ''}`
                    : style === 'pillow'
                        ? `${pillowButtonClass} ${className} ${disabled || loading ? disabledButtonClass : ''}`
                        : `${fixedButtonClass} ${className} ${disabled || loading ? disabledButtonClass : ''}`
            }
            onClick={onClick}
            disabled={disabled || loading}
        >
            <span className="relative flex items-center justify-center">
                {/* Always render the content to maintain button size */}
                <span
                    className="flex flex-row group-active:[transform:translate3d(0,1px,0)] whitespace-nowrap"
                    style={{
                        opacity: loading ? 0 : 1,
                    }}
                >
                    {icon ?
                        <div className="mt-0.5 mr-1">
                            {React.createElement(icon)}
                        </div> :
                        ''}
                    <div>{children}</div>
                </span>

                {/* Loader positioned absolutely over the content when loading */}
                {loading && (
                    <span className="absolute inset-0 flex items-center justify-center">
                        <Loader height={24} width={36} radius={3} color="hsl(var(--button-text))" wrapperClass="flex items-center justify-center"/>
                    </span>
                )}
            </span>
        </button>
    )
}
