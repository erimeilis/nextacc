'use client'
import React from 'react'
import Loader from './service/Loader'
import {NumberInfo} from '@/types/NumberInfo'
import Show from '@/components/service/Show'
import {Label} from '@/components/ui/label'
import {Radio, RadioGroup} from '@/components/ui/radio-group'
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
    const handleOptionChange = (value: string) => {
        // Only trigger change if the option isn't already selected
        if (value !== selectedOption) {
            const selectedNumberInfo = options.find(option => option.did === value);
            if (!selectedNumberInfo) return;

            onSelectAction(selectedNumberInfo);
        }
    }

    // Add a click handler for the label
    const handleLabelClick = (did: string) => {
        // Only trigger change if the option isn't already selected
        if (did !== selectedOption) {
            const selectedNumberInfo = options.find(option => option.did === did);
            if (!selectedNumberInfo) return;

            onSelectAction(selectedNumberInfo);
        }
    }

    return (
        <Show when={!loading || options.length > 0}
              fallback={<Loader height={32}/>}>
            <RadioGroup
                value={selectedOption || undefined}
                name="list-radio"
                onValueChange={handleOptionChange}>
                <div className="w-full grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                    {
                        options.map((option) => {
                            const isSelected = selectedOption === option.did;
                            return (
                                <div key={option.did} className="flex flex-row items-center gap-3 p-2 rounded-md border border-border hover:bg-muted/50 transition-colors overflow-hidden">
                                    <Radio
                                        id={option.did}
                                        value={option.did}
                                        checked={isSelected}
                                    />
                                    <Label 
                                        htmlFor={option.did}
                                        className={`w-full flex flex-row items-center gap-1.5 py-1 text-sm font-medium ${isSelected ? 'text-primary' : 'cursor-pointer'}`}
                                        onClick={isSelected ? undefined : () => handleLabelClick(option.did)}
                                    >
                                        {option.name}
                                        {option.voice ? <Phone weight="fill" className={isSelected ? "text-primary" : "text-muted-foreground"} size={16}/> : ''}
                                        {option.sms ? <ChatCircleText weight="fill" className={isSelected ? "text-primary" : "text-muted-foreground"} size={16}/> : ''}
                                        {option.fax ? <Printer weight="fill" className={isSelected ? "text-primary" : "text-muted-foreground"} size={16}/> : ''}
                                        {option.toll_free ? <Headset weight="fill" className={isSelected ? "text-primary" : "text-muted-foreground"} size={16}/> : ''}
                                    </Label>
                                </div>
                            );
                        })
                    }
                </div>
            </RadioGroup>
        </Show>
    )
}
