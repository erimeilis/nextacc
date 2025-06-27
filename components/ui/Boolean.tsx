import * as React from 'react'
import {DotOutlineIcon} from '@phosphor-icons/react'
import {cn} from '@/lib/utils'

interface BooleanProps {
    value: boolean
    className?: string
}

const Boolean = ({value, className}: BooleanProps) => {
    return (
        <div className={cn('flex items-center', className)}>
            <DotOutlineIcon
                className={cn(
                    'h-6 w-6',
                    value ? 'text-green-300 fill-green-300' : 'text-red-300 fill-red-300'
                )}
            />
        </div>
    )
}

export {Boolean}
