'use client'
import ActionButton from '@/components/shared/ActionButton'
import {useTranslations} from 'next-intl'
import Loader from '@/components/service/Loader'
import React from 'react'

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const t = useTranslations('common')
    return (
        <div className="flex flex-col m-auto items-center justify-center px-4 py-8
        sm:w-3/5 md:w-1/2 lg:w-2/5 max-w-2xl z-50 overflow-auto h-fit inset-1
        rounded-md bg-slate-200 dark:bg-slate-800 shadow-sm">
            <h2 className="text-slate-500 dark:text-slate-400">{error.message}</h2>
            <div className="flex items-center justify-center w-full px-10">
                <Loader height={50}/>
            </div>
            <ActionButton type="button" onClick={() => reset()}>
                {t('refresh')}
            </ActionButton>
        </div>
    )
}
