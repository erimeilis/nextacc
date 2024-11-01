'use client'
import Loading from '@/app/[locale]/components/Loading'
import Login from '@/app/[locale]/components/Login'
import ProfileKatan from '@/app/[locale]/components/ProfileKatan'
import {useSession} from 'next-auth/react'

export default function ProfileGadol() {
    const session = useSession()

    return (session) ?
        (session.status === 'authenticated') ?
            <ProfileKatan/> :
            (session.status === 'loading') ?
                <Loading height="350"/> :
                <Login/> :
        <Login/>
}