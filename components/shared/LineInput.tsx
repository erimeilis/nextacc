'use client'
import React, {ChangeEvent, useState} from 'react'
import {EyeIcon, EyeSlashIcon} from '@phosphor-icons/react'
import {Label} from '@/components/ui/Label'
import {Input} from '@/components/ui/Input'

const fixedErrorClass = 'flex items-center w-fit transition-transform duration-500 ' +
    'font-medium tracking-wide text-white text-xs ' +
    'mt-1 ml-1 px-2 py-0.5 ' +
    'bg-red-500 dark:bg-red-600 '

export default function LineInput({
                                      handleAction = () => {
                                      },
                                      value,
                                      labelText,
                                      labelFor,
                                      id,
                                      name,
                                      type,
                                      isRequired = false,
                                      placeholder,
                                      customClass,
                                      error = '',
                                      size = 'md',
                                      disabled = false
                                  }: {
    handleAction?: (event: ChangeEvent<HTMLInputElement>) => void
    value: string
    labelText?: string
    labelFor?: string
    id: string
    name: string
    type: string
    isRequired?: boolean
    placeholder?: string
    customClass?: string
    error?: string
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
}) {
    const displayErr = error === '' ? 'invisible' : 'visible'
    const displayEye = type === 'password' ? 'visible' : 'invisible'
    const [typeState, setTypeState] = useState(type)

    const switchPass = () => {
        setTypeState(typeState === 'password' ? 'text' : 'password')
    }

    return (
        <div className="flex flex-row w-full">
            <Label
                htmlFor={labelFor}
                className="flex text-xs sm:text-sm p-2 items-center font-light min-w-24 w-24 sm:min-w-32 sm:w-32 text-muted-foreground"
            >
                {labelText}:
            </Label>
            <div className="relative flex-grow flex items-end">
                <Input
                    onChange={handleAction}
                    value={value}
                    id={id}
                    name={name}
                    type={typeState}
                    className={`bg-transparent border-0 border-b border-input rounded-none py-0 mb-0 text-right sm:text-left ${customClass} ${size === 'sm' ? 'h-8 text-sm' : size === 'lg' ? 'h-12 text-lg' : 'h-10'}`}
                    placeholder={placeholder}
                    required={isRequired}
                    disabled={disabled}
                    readOnly={disabled}
                />
                <div className={'absolute flex border border-transparent right-0 top-0 h-full w-10 ' + displayEye}>
                    <button type="button" tabIndex={-1} aria-hidden="true" className="flex items-center justify-center rounded-tl rounded-bl z-10
                    text-stone-500 dark:text-indigo-200 text-xs h-full w-full" onClick={switchPass}>
                        {typeState === 'password' ? <EyeIcon/> : <EyeSlashIcon/>}
                    </button>
                </div>
            </div>
            <span className={fixedErrorClass + displayErr}>
                {error}
            </span>
        </div>
    )
}
