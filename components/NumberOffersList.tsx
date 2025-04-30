'use client'
import React, {ChangeEvent} from 'react'
import Loader from './service/Loader'
import {NumberInfo} from '@/types/NumberInfo'
import Show from '@/components/service/Show'
import {Label, Radio} from 'flowbite-react'
import {ChatCircleText, Headset, Phone, Printer} from '@phosphor-icons/react'

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
            where_did: event.target.getAttribute('data-where_did') ?? '',
            setup_rate: Number(event.target.getAttribute('data-setup_rate')),
            fix_rate: Number(event.target.getAttribute('data-fix_rate')),
            voice: event.target.getAttribute('data-voice') == 'true',
            sms: event.target.getAttribute('data-sms') == 'true',
            fax: event.target.getAttribute('data-fax') == 'true',
            toll_free: event.target.getAttribute('data-toll_free') == 'true',
            incoming_per_minute: Number(event.target.getAttribute('data-incoming_per_minute')),
            toll_free_rate_in_min: Number(event.target.getAttribute('data-toll_free_rate_in_min')),
            incoming_rate_sms: Number(event.target.getAttribute('data-incoming_rate_sms')),
            docs: event.target.getAttribute('data-docs') ?? ''
        })
    }
    return (
        <Show when={!loading || options.length > 0}
              fallback={<Loader height={32}/>}>
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 px-4">
                {
                    options.map((option) =>
                        <div key={option.did} className="flex flex-row items-center gap-2">
                            <Radio
                                id={option.did}
                                value={option.did}
                                data-where_did={option.where_did}
                                data-setup_rate={option.setup_rate}
                                data-fix_rate={option.fix_rate}
                                data-voice={option.voice.toString()}
                                data-sms={option.sms.toString()}
                                data-fax={option.fax.toString()}
                                data-toll_free={option.toll_free.toString()}
                                data-incoming_per_minute={option.incoming_per_minute}
                                data-toll_free_rate_in_min={option.toll_free_rate_in_min}
                                data-incoming_rate_sms={option.incoming_rate_sms}
                                data-docs={option.docs}
                                name="list-radio"
                                //className="w-2 h-2"
                                onChange={handleOptionChange}
                                defaultChecked={selectedOption === option.did}
                            />
                            <Label htmlFor={option.did}
                                   className="w-full flex flex-row items-center cursor-pointer py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300 text-opacity-100 dark:text-opacity-100">
                                {option.name}&nbsp;{option.voice ? <Phone weight="thin"/> : ''}{option.sms ? <ChatCircleText weight="thin"/> : ''}{option.fax ?
                                <Printer weight="thin"/> : ''}{option.toll_free ?
                                <Headset weight="thin"/> : ''}
                            </Label>
                        </div>
                    )
                }
            </div>
        </Show>
    )
};