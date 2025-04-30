'use client'
import Loader from '@/components/service/Loader'
import { Label } from '@/components/ui/label'
import {ChangeEvent} from 'react'
import getSlug from '@/utils/getSlug'
import Show from '@/components/service/Show'

export default function DropdownSelect({
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
    data: { id: string, name: string }[]
    onSelectAction: (value: string) => void
    selectedOption?: string | null
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
        onSelectAction(event.target.value)
    }
    return (
        <Show
            when={!loading || items.length > 0}
            fallback={<Loader height={8}/>}
        >
            <div className={`min-w-[200px] ${customClass}`}>
                <Label
                    htmlFor={selectId}
                    className="text-sm font-medium mb-2 block">
                    {selectTitle}
                </Label>
                <div className="relative">
                    <select
                        id={selectId}
                        name={selectId}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background 
                        appearance-none cursor-pointer
                        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 
                        disabled:cursor-not-allowed disabled:opacity-50"
                        value={selectedOption ?? 'none'}
                        onChange={handleOptionChange}
                        disabled={data.length === 0}
                    >
                        <option
                            value="none"
                            disabled
                            hidden
                        >
                            {selectTitle}
                        </option>
                        {items}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>
        </Show>
    )
}
