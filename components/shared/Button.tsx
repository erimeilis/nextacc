'use client'
import React, {FC, SVGProps} from 'react'

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
    text-primary-foreground bg-primary hover:bg-primary/90 active:bg-primary/80
`
const disabledButtonClass = `
    opacity-50 cursor-not-allowed
`

const pillowButtonClass = `
    flex w-fit h-fit cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors
    text-primary-foreground bg-primary hover:bg-primary/90 active:bg-primary/80
    shadow-sm hover:shadow
`

export default function Button({
                                   id,
                                   name,
                                   type = 'button',
                                   className = '',
                                   onClick,
                                   disabled = false,
                                   style = 'line',
                                   icon,
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
                    ? `${fixedLineButtonClass} ${className} ${disabled ? disabledLineButtonClass : ''}`
                    : style === 'pillow'
                        ? `${pillowButtonClass} ${className} ${disabled ? disabledButtonClass : ''}`
                        : `${fixedButtonClass} ${className} ${disabled ? disabledButtonClass : ''}`
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
