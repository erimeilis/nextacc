import Loading from '@/app/[locale]/components/Loading'
import {Label} from 'flowbite-react'

export default function DropdownSelect({
                                           selectId,
                                           selectTitle = '',
                                           data = [],
                                           onSelect,
                                           selectedOption,
                                           loading = false
                                       }) {
    const items = data.map(item => (
        <option value={parseInt(item.id)} key={item.id}>{item.name}</option>
    ))
    const handleOptionChange = (event) => {
        const value = event.target.value
        onSelect(value)
    }

    return (
        (!loading || items.length > 0) ?
            <div className="w-full min-w-[200px]">
                <Label
                    htmlFor={selectId}
                    className="pl-1 mb-1 text-xs sm:text-sm tracking-wide text-gray-600 dark:text-slate-400 hidden">
                    {selectTitle}
                </Label>
                <select
                    id={selectId}
                    name={selectId}
                    className="rounded-md pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none drop-shadow focus:drop-shadow-md
                    appearance-none cursor-pointer text-sm h-full w-full border-none
                    bg-gray-100 text-gray-900 focus:ring-1 focus:ring-gray-300 disabled:text-gray-300 disabled:bg-gray-50
                    dark:bg-indigo-950 dark:text-slate-300 dark:focus:ring-indigo-500 dark:disabled:text-slate-500 dark:disabled:bg-slate-800"
                    value={selectedOption ?? 'none'}
                    onChange={handleOptionChange}
                    disabled={data.length === 0}
                >
                    <option value="none" disabled hidden>{selectTitle}</option>
                    {items}
                </select>
            </div> :
            <Loading height="8"/>
    )
}