'use client'
import {Label, TextInput} from 'flowbite-react'
import React, {ChangeEvent, FC, SVGProps, useState} from 'react'
import {Eye, EyeSlash} from '@phosphor-icons/react'

//const fixedInputClass = 'text-sm px-2 py-1 '
const fixedErrorClass = 'flex items-center w-fit transition-transform duration-500 ' +
    'font-medium tracking-wide text-white text-xs ' +
    'mt-1 ml-1 px-2 py-0.5 ' +
    'bg-red-500 dark:bg-red-600 '

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
                                  icon,
                                  error = '',
                                  size = 'md',
                                  disabled = false
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
}) {
    const displayErr = error === '' ? 'invisible' : 'visible'
    const displayEye = type === 'password' ? 'visible' : 'invisible'
    const [typeState, setTypeState] = useState(type)

    const switchPass = () => {
        setTypeState(typeState === 'password' ? 'text' : 'password')
    }

    return (
        <div className={'flex flex-col mb-3 ' + customClass}>
            <Label
                htmlFor={labelFor}
                className="text-sm pl-1"
            >
                {labelText}
            </Label>
            <div className="relative">
                <TextInput
                    onChange={handleChangeAction}
                    value={value}
                    id={id}
                    name={name}
                    type={typeState}
                    //className={customClass}
                    icon={icon}
                    placeholder={placeholder}
                    required={isRequired}
                    sizing={size}
                    disabled={disabled}
                    readOnly={disabled}
                />
                <div className={'absolute flex border border-transparent right-0 top-0 h-full w-10 ' + displayEye}>
                    <button type="button" tabIndex={-1} aria-hidden="true" className="flex items-center justify-center rounded-tl rounded-bl z-10
                    text-stone-500 dark:text-indigo-200 text-xs h-full w-full" onClick={switchPass}>
                        {typeState === 'password' ? <Eye/> : <EyeSlash/>}
                    </button>
                </div>
            </div>
            <span className={fixedErrorClass + displayErr}>
                {error}
            </span>
        </div>
    )
}