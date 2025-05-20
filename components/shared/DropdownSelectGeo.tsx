'use client'
import Loader from '@/components/service/Loader'
import {Label} from '@/components/ui/label'
import {ChangeEvent, useState, useEffect, useRef} from 'react'
import getSlug from '@/utils/getSlug'

export default function DropdownSelectGeo({
                                              selectId,
                                              selectTitle = '',
                                              data,
                                              onSelectAction,
                                              selectedOption,
                                              //loading = false,
                                              customClass = ''
                                          }: {
    selectId: string
    selectTitle: string
    data: { id: number | string, name: string }[] | null | undefined
    onSelectAction: (value: number | string) => void
    selectedOption?: number | string | null
    //loading?: boolean
    customClass?: string
}) {
    const [localSelectedOption, setLocalSelectedOption] = useState<number | string | null>(selectedOption || null);
    const selectRef = useRef<HTMLSelectElement>(null);

    // Update local state when prop changes
    useEffect(() => {
        setLocalSelectedOption(selectedOption || null);
    }, [selectedOption]);

    const items = data?.map(item => (
        <option
            value={item.id}
            key={item.id}
            data-slug={getSlug(item.name)}
            className="flex-1 text-wrap"
        >
            {item.name}
        </option>
    ))

    const handleOptionChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const newValue = Number(event.target.value);

        // Update local state immediately
        setLocalSelectedOption(newValue);

        // Delay calling the parent's handler to allow the UI to update first
        setTimeout(() => {
            onSelectAction(newValue);
        }, 0);
    }

    const slugOption = data?.find(e => getSlug(e.name) == localSelectedOption)

    return (
        <div className={'min-w-[200px] ' + customClass}>
            <Label
                htmlFor={selectId}
                className="pl-1 mb-1 text-xs sm:text-sm tracking-wide text-muted-foreground dark:text-muted-foreground hidden">
                {selectTitle}
            </Label>
            <select
                ref={selectRef}
                id={selectId}
                name={selectId}
                className="flex rounded-md pl-3 pr-8 py-2 transition-all duration-300 ease-in-out focus:outline-none drop-shadow hover:drop-shadow-lg focus:drop-shadow-md
                appearance-none cursor-pointer text-sm h-full w-full border-none
                bg-accent text-foreground focus:ring-1 focus:ring-ring disabled:text-muted-foreground disabled:bg-muted
                dark:bg-accent dark:text-foreground dark:focus:ring-ring dark:disabled:text-muted-foreground dark:disabled:bg-muted
                animate-in fade-in zoom-in-95 duration-200 hover:scale-[1.01] active:scale-[0.99]"
                value={localSelectedOption ?
                    (!isNaN(+localSelectedOption)) ?
                        localSelectedOption :
                        slugOption ?
                            slugOption.id :
                            'none' :
                    'none'}
                onChange={handleOptionChange}
                disabled={data?.length === 0}
            >
                <option
                    value="none"
                    disabled
                    hidden
                    className="flex-1 text-wrap"
                >
                    {selectTitle}
                </option>
                {items || (
                    <option value={localSelectedOption || 'none'} disabled>
                        {data?.find(item => item.id === localSelectedOption)?.name || selectTitle}
                    </option>
                )}
            </select>
            {!items && <div className="hidden"><Loader height={8}/></div>}
        </div>
    )
}
