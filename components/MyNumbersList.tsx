'use client'
import React from 'react'
import Loader from './service/Loader'
import Show from '@/components/service/Show'
import {NumberInfo} from '@/types/NumberInfo'

export default function MyNumbersList({
                                          options,
                                      }: {
    options: NumberInfo[]
}) {
    return (
        <Show when={options.length > 0}
              fallback={<Loader height={32}/>}>
            <div className="flex flex-col w-full">
                {
                    options.map((option, i) =>
                        <div key={option.did.toString()}
                             className={'flex flex-row w-full justify-between text-sm p-2 gap-2 ' + (i % 2 != 0 ? 'bg-gray-200 dark:bg-indigo-900 bg-opacity-50' +
                                 ' dark:bg-opacity-40' : '')}>
                            <div className="flex">{option.did.toString()}</div>
                            <div className="flex">{option.name}</div>
                            <div className="flex">{option.where_did}</div>
                        </div>
                    )
                }
            </div>
        </Show>
    )
};