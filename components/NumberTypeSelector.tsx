'use client'
import {ListGroup} from 'flowbite-react'
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
        <div className="flex justify-center">
            <ListGroup>
                {options.map((option) =>
                    <ListGroup.Item
                        key={option}
                        id={option}
                        value={option}
                        onClick={() => handleOptionChange(option)}
                        active={selectedOption === option}
                    >
                        {t(option)}
                    </ListGroup.Item>
                )
                }
            </ListGroup>
        </div>
    )
};