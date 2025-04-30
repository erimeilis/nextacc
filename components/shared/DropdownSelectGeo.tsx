'use client'
import Loader from '@/components/service/Loader'
import { Label } from '@/components/ui/label'
import {ChangeEvent} from 'react'
import getSlug from '@/utils/getSlug'
import Show from '@/components/service/Show'

export default function DropdownSelectGeo({
                                              selectId,
                                              selectTitle = '',
                                              data = [],
                                              onSelectAction,
                                              selectedOption,
                                              loading = false,
                                              customClass = ''
                                          }: {
    selectId: string
    selectTitle: string
    data: { id: number | string, name: string }[]
    onSelectAction: (value: number | string) => void
    selectedOption?: number | string | null
    loading?: boolean
    customClass?: string
}) {
    const items = data.map(item => (
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
        onSelectAction(Number(event.target.value))
    }
    const slugOption = data.find(e => getSlug(e.name) == selectedOption)
    return (
        <Show
            when={!loading || items.length > 0}
            fallback={<Loader height={8}/>}
        >
            <div className={'min-w-[200px] ' + customClass}>
                <Label
                    htmlFor={selectId}
                    className="pl-1 mb-1 text-xs sm:text-sm tracking-wide text-muted-foreground dark:text-muted-foreground hidden">
                    {selectTitle}
                </Label>
                <select
                    id={selectId}
                    name={selectId}
                    className="flex rounded-md pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none drop-shadow focus:drop-shadow-md
                    appearance-none cursor-pointer text-sm h-full w-full border-none
                    bg-accent text-foreground focus:ring-1 focus:ring-ring disabled:text-muted-foreground disabled:bg-muted
                    dark:bg-accent dark:text-foreground dark:focus:ring-ring dark:disabled:text-muted-foreground dark:disabled:bg-muted"
                    value={selectedOption ?
                        (!isNaN(+selectedOption)) ?
                            selectedOption :
                            slugOption ?
                                slugOption.id :
                                'none' :
                        'none'}
                    onChange={handleOptionChange}
                    disabled={data.length === 0}
                >
                    <option
                        value="none"
                        disabled
                        hidden
                        className="flex-1 text-wrap"
                    >
                        {selectTitle}
                    </option>
                    {items}
                </select>
            </div>
        </Show>
    )
}
