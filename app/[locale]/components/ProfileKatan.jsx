'use client'
import Button from '@/app/[locale]/components/Button'
import Input from '@/app/[locale]/components/Input'
import {redLoginToken} from '@/app/api/auth/[...nextauth]/restRequests'
import {Card} from 'flowbite-react'
import {signOut, useSession} from 'next-auth/react'
import {useTranslations} from 'next-intl'
import useSWR from 'swr'

export default function ProfileKatan() {

    const session = useSession()
    const t = useTranslations('login')

    function Userinfo() {
        const {data} = useSWR(session.data.token, redLoginToken)
        return data ?? []
    }

    const info = Userinfo()
    const fields = [
        {id: 'firstname', value: info.firstname},
        {id: 'lastname', value: info.lastname},
        {id: 'company', value: info.company},
        {id: 'country', value: info.country},
        {id: 'address', value: info.address},
        {id: 'phone', value: info.phone},
    ]

    return (
        <>
            <Card id="profile_katan">
                <div className="flex items-center justify-between">
                    <p className="text-sm">{t('signed_in_as')} {info.email} ({info.id})</p>
                    <Button>
                        Balance: {parseFloat(info.credit).toFixed(2) + ' ' + info.currency}
                    </Button>
                    <Button
                        onClick={() => signOut()}>
                        {t('signout')}
                    </Button>
                </div>
                <div className="flex flex-col w-full">
                    {fields.map(field =>
                        <Input
                            sizing="sm"
                            key={field.id}
                            value={field.value}
                            id={field.id}
                            readonly
                        />
                    )}
                </div>
            </Card>
        </>
    )
}