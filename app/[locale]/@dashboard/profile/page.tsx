'use server'
import Profile from '@/components/Profile'
import {redGetUserProfile} from '@/app/api/redreport/profile'

export default async function Page() {
    const profile = await redGetUserProfile()

    return <Profile
        profile={profile}
    />
}