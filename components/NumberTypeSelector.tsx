'use client'
import { ListGroup } from '@/components/ui/list-group'
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
        <div className="flex justify-center w-full">
            <ListGroup horizontal className="w-full">
                {options.map((option) =>
                    <ListGroup.Item
                        key={option}
                        id={option}
                        value={option}
                        onClick={() => handleOptionChange(option)}
                        active={selectedOption === option}
                        className="flex-1 justify-center text-center"
                    >
                        {t(option)}
                    </ListGroup.Item>
                )
                }
            </ListGroup>
        </div>
    )
};
