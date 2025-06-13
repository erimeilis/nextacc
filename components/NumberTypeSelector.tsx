'use client'
import Tab from '@/components/shared/Tab'
import {useTranslations} from 'next-intl'
import React, {useEffect, useState} from 'react'

export default function NumberTypeSelector({
                                               options,
                                               onSelectAction,
                                               selectedOption
                                           }: {
    options: string[]
    onSelectAction: (type: string) => void
    selectedOption: string | null
}) {
    // Local state to track the visually selected option
    const [localSelectedOption, setLocalSelectedOption] = useState<string | null>(selectedOption)
    // Loading state to show loading animation
    const [isLoading, setIsLoading] = useState<boolean>(false)

    // Update local state when prop changes
    useEffect(() => {
        setLocalSelectedOption(selectedOption)
        setIsLoading(false)
    }, [selectedOption])

    const handleOptionChange = (option: string) => {
        // Prevent clicking on the already selected option
        if (localSelectedOption === option) {
            return
        }

        // Immediately update the UI
        setLocalSelectedOption(option)
        // Show loading state
        setIsLoading(true)
        // Call the parent's action handler
        onSelectAction(option)
    }

    const t = useTranslations('offers')
    return (
        <nav className="flex flex-row w-full justify-evenly bg-muted dark:bg-muted">
            {options.map((option) => {
                const isActive = localSelectedOption === option
                return (
                    <Tab
                        key={option}
                        type="button"
                        onClick={() => handleOptionChange(option)}
                        active={isActive}
                        className={`rounded-t-none sm:rounded-t-md ${isActive ? 'pointer-events-none' : ''}`}
                        isLoading={isLoading && isActive}
                    >
                        {t(option)}
                    </Tab>
                )
            })}
        </nav>
    )
}
