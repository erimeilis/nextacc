'use client'
import Button from '@/app/[locale]/components/Button'
import Loading from '@/app/[locale]/components/Loading'
import Login from '@/app/[locale]/components/Login'
import {signOut, useSession} from 'next-auth/react'
import {useTranslations} from 'next-intl'

export default function Profile() {

    const session = useSession()
    const t = useTranslations('login')

    return (session) ?
        (session.status === 'authenticated') ?
            <>
                <div className="flex items-center justify-between text-gray-800 dark:text-indigo-200 w-full bg-gray-100 dark:bg-indigo-950 p-10 rounded-md drop-shadow">
                    <div>{t('signed_in_as')} {session.data.user.email} ({session.data.user.id})</div>
                    <Button onClick={() => signOut()}>
                        {t('signout')}
                    </Button>
                </div>
            </> :
            (session.status === 'loading') ?
                <Loading height="350"/> :
                <Login/> :
        <Login/>
}