import * as Icon from '@phosphor-icons/react'
import {Label, TextInput} from 'flowbite-react'
import React, {useState} from 'react'

//const fixedInputClass = 'text-sm sm:text-base relative w-full border rounded-md placeholder-gray-400 focus:border-amber-500 dark:focus:border-indigo-400 focus:outline-none py-2 pr-2 pl-12 border-slate-700 bg-white dark:bg-slate-800 text-black dark:text-white '
const fixedErrorClass = 'flex items-center w-fit transition-transform duration-500 ' +
    'font-medium tracking-wide text-white text-xs ' +
    'mt-1 ml-1 px-2 py-0.5 ' +
    'bg-red-500 dark:bg-red-600 '

export default function Input({
                                  handleChange,
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
                              }) {
    const displayErr = error === '' ? 'invisible' : 'visible'
    const displayEye = type === 'password' ? 'visible' : 'invisible'
    const [typeState, setTypeState] = useState(type)

    const switchPass = () => {
        setTypeState(typeState === 'password' ? 'text' : 'password')
    }

    return (
        <div className="flex flex-col mb-4">
            <Label htmlFor={labelFor}>
                {labelText}
            </Label>
            <div className="relative">
                <TextInput
                    onChange={handleChange}
                    value={value}
                    id={id}
                    name={name}
                    type={typeState}
                    className={customClass}
                    icon={Icon[`${icon}`]}
                    placeholder={placeholder}
                    required={isRequired}
                />
                <div className={'absolute flex border border-transparent right-0 top-0 h-full w-10 ' + displayEye}>
                    <button type="button" className="flex items-center justify-center rounded-tl rounded-bl z-10
                    text-stone-500 dark:text-indigo-200 text-xs h-full w-full" onClick={switchPass}>
                        {typeState === 'password' ? <Icon.Eye/> : <Icon.EyeSlash/>}
                    </button>
                </div>
            </div>
            <span className={fixedErrorClass + displayErr}>
                {error}
            </span>
        </div>
    )
}