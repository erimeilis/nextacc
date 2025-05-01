'use client'
import Tab from '@/components/shared/Tab'
import {useTranslations} from 'next-intl'
import React from 'react'

export default function NumberTypeSelector({
                                               options,
                                               onSelectAction,
                                               selectedOption
                                           }: {
    options: string[]
    onSelectAction: (type: string) => void
    selectedOption: string | null
}) {
    const handleOptionChange = (option: string) => {
        onSelectAction(option)
    }
    const t = useTranslations('offers')
    return (
        <nav className="flex flex-row w-full justify-evenly bg-background dark:bg-background">
            {options.map((option) =>
                <Tab
                    key={option}
                    type="button"
                    onClick={() => handleOptionChange(option)}
                    active={selectedOption === option}
                >
                    {t(option)}
                </Tab>
            )}
        </nav>
    )
}
