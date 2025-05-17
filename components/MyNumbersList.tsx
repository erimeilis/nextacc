'use client'
import React from 'react'
import Show from '@/components/service/Show'
import {NumberInfo} from '@/types/NumberInfo'
import Loader from '@/components/service/Loader'

export default function MyNumbersList({
                                          options,
                                      }: {
    options: NumberInfo[] | null
}) {
    return (
        <Show when={options !== null}
              fallback={options?.length == 0 ?
                  <div>You have no numbers yet</div> :
                  <Loader height={32}/>}>
            <div className="flex flex-col w-full">
                {
                    options?.map((option, i) =>
                        <div key={option.did.toString()}
                             className={'flex flex-row w-full justify-between text-sm p-2 gap-2 ' + (i % 2 != 0 ? 'bg-muted/50 dark:bg-muted/40' : '')}>
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
