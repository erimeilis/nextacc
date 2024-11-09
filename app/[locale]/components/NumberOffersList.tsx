'use client'
import {Label, Radio} from 'flowbite-react'
import React, {ChangeEvent} from 'react'
import Loading from './Loading'
import {NumberInfo} from '@/app/api/types/NumberInfo'

export default function NumberOffersList({
                                             options,
                                             onSelectAction,
                                             selectedOption,
                                             loading = false
                                         }: {
    options: NumberInfo[]
    onSelectAction: (number: NumberInfo) => void
    selectedOption: string | null
    loading: boolean
}) {
    const handleOptionChange = (event: ChangeEvent<HTMLInputElement>) => {
        onSelectAction({
            did: event.target.value,
            name: event.target.value,
            where_did: event.target.getAttribute('data-where_did'),
            setuprate: event.target.getAttribute('data-setuprate'),
            fixrate: event.target.getAttribute('data-fixrate'),
            incoming_per_minute: event.target.getAttribute('data-incoming_per_minute'),
            tollfree_rate_in_min: event.target.getAttribute('data-tollfree_rate_in_min'),
            incoming_rate_sms: event.target.getAttribute('data-incoming_rate_sms'),
            docs: event.target.getAttribute('data-docs')
        } as NumberInfo)
    }
    return (
        (!loading || options.length > 0) ?
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 px-4">
                {
                    options.map((option) =>
                        <div key={option.did} className="flex flex-row items-center gap-2">
                            <Radio
                                id={option.did}
                                value={option.did}
                                data-where_did={option.where_did}
                                data-setuprate={option.setuprate}
                                data-fixrate={option.fixrate}
                                data-incoming_per_minute={option.incoming_per_minute}
                                data-tollfree_rate_in_min={option.tollfree_rate_in_min}
                                data-incoming_rate_sms={option.incoming_rate_sms}
                                data-docs={option.docs}
                                name="list-radio"
                                //className="w-2 h-2"
                                onChange={handleOptionChange}
                                defaultChecked={selectedOption === option.did}
                            />
                            <Label htmlFor={option.did} className="w-full cursor-pointer py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                {option.name}
                            </Label>
                        </div>
                    )
                }
            </div> :
            <Loading height={32}/>
    )
};