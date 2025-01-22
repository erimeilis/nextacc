'use client'
import React from 'react'
import Loader from './service/Loader'
import Show from '@/components/service/Show'
import {MoneyTransaction} from '@/types/MoneyTransaction'

export default function MoneyTransactionsList({
                                                  options,
                                              }: {
    options: MoneyTransaction[]
}) {
    return (
        <Show when={options.length > 0}
              fallback={<Loader height={32}/>}>
            <div className="flex flex-col w-full">
                {
                    options.map((option, i) =>
                        <div key={option.datetime.toString()}
                             className={'flex flex-row w-full justify-between text-sm p-2 gap-2 ' + (i % 2 != 0 ? 'bg-gray-200 dark:bg-indigo-900 bg-opacity-50' +
                                 ' dark:bg-opacity-40' : '')}>
                            <div className="flex">{option.datetime.toString()}</div>
                            <div className="flex">{option.amount}</div>
                            <div className="flex">{option.description}</div>
                        </div>
                    )
                }
            </div>
        </Show>
    )
};