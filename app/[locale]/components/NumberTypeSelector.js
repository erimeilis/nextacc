'use client'
import {ListGroup} from 'flowbite-react'
import {useTranslations} from 'next-intl'
import React from 'react'

export default function NumberTypeSelector({
                                               options,
                                               onSelect,
                                               selectedOption
                                           }) {
    const handleOptionChange = (event) => {
        const value = event.target.value
        onSelect(value)
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
                        onClick={handleOptionChange}
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