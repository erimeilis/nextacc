'use client'
import {ThreeDots} from 'react-loader-spinner'
import Button from '@/app/[locale]/components/Button'
import {useTranslations} from 'next-intl'

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
                <ThreeDots
                    visible={true}
                    height="48"
                    width="48"
                    color="#64748b"
                    radius="4"
                    ariaLabel="three-dots-loading"
                />
            </div>
            <Button onClick={() => reset()}>
                {t('refresh')}
            </Button>
        </div>
    )
}