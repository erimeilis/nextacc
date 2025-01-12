'use server'
import Profile from '@/components/Profile'

export default async function Page() {
    //const profile = await redGetUserProfile()

    return <Profile
        profile={null}
    />
}