'use client'
import Button from '@/app/[locale]/components/Button'
import {signOut, useSession} from 'next-auth/react'
import {useTranslations} from 'next-intl'

export default function ProfileKatan() {

    const session = useSession()
    const t = useTranslations('login')

    return (<>
        <div className="flex items-center justify-between text-gray-800 dark:text-indigo-200 w-full bg-gray-100 dark:bg-indigo-950 p-10 rounded-md drop-shadow">
            <div>{t('signed_in_as')} {session.data.user.email} ({session.data.user.id})</div>
            <Button onClick={() => signOut()}>
                {t('signout')}
            </Button>
        </div>
    </>)
}