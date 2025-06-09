'use client'
import {Label} from '@/components/ui/label'
import {Input as TextInput} from '@/components/ui/input'
import React, {ChangeEvent, FC, SVGProps, useState} from 'react'
import {EyeIcon, EyeSlashIcon} from '@phosphor-icons/react'

//const fixedInputClass = 'text-sm px-2 py-1 '
const fixedErrorClass = `
    flex items-center w-fit transition-transform duration-300
    font-medium tracking-wide text-destructive-foreground text-xs
    mt-1.5 px-2 py-1
    bg-destructive rounded-md
`

export default function Input({
                                  handleChangeAction,
                                  value,
                                  labelText,
                                  labelFor,
                                  id,
                                  name,
                                  type,
                                  isRequired = false,
                                  placeholder,
                                  customClass,
                                  icon, // eslint-disable-line @typescript-eslint/no-unused-vars
                                  error = '',
                                  size = 'md',
                                  disabled = false,
                                  hideLabel = false
                              }: {
    handleChangeAction: (event: ChangeEvent<HTMLInputElement>) => void
    value: string
    labelText?: string
    labelFor?: string
    id: string
    name: string
    type: string
    isRequired?: boolean
    placeholder?: string
    customClass?: string
    icon?: FC<SVGProps<SVGSVGElement>>
    error?: string
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    hideLabel?: boolean
}) {
    const displayErr = error === '' ? 'invisible' : 'visible'
    const displayEye = type === 'password' ? 'visible' : 'invisible'
    const [typeState, setTypeState] = useState<string>(type)

    const switchPass = () => {
        setTypeState(typeState === 'password' ? 'text' : 'password')
    }

    return (
        <div className={`flex flex-col ${customClass}`}>
            {!hideLabel && (
                <Label
                    htmlFor={labelFor}
                    className="text-xs font-normal pl-1"
                >
                    {labelText}
                </Label>
            )}
            <div className="relative">
                <TextInput
                    onChange={handleChangeAction}
                    value={value}
                    id={id}
                    name={name}
                    type={typeState}
                    className={size === 'sm' ? 'h-8 text-sm' : size === 'lg' ? 'h-12 text-lg' : 'h-10'}
                    placeholder={placeholder}
                    required={isRequired}
                    disabled={disabled}
                    readOnly={disabled}
                />
                <div className={`absolute flex right-0 top-0 h-full w-10 ${displayEye}`}>
                    <button
                        type="button"
                        tabIndex={-1}
                        aria-hidden="true"
                        className="flex items-center justify-center z-10 text-muted-foreground hover:text-foreground text-sm h-full w-full transition-colors"
                        onClick={switchPass}
                    >
                        {typeState === 'password' ? <EyeIcon size={20}/> : <EyeSlashIcon size={20}/>}
                    </button>
                </div>
            </div>
            <span className={`${fixedErrorClass} ${displayErr}`}>
                {error}
            </span>
        </div>
    )
}
