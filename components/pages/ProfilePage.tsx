'use client'
import Profile from '@/components/Profile'
import {useClientStore} from '@/stores/useClientStore'
import {useEffect, useState} from 'react'
import {UserProfile} from '@/types/UserProfile'

export default function ProfilePage() {
    const [localProfile, setLocalProfile] = useState<UserProfile | null>(null)
    const {getProfile, updateProfile} = useClientStore()
    const profile = getProfile()

    // Set data from the store immediately if available
    useEffect(() => {
        if (profile) {
            setLocalProfile(profile)
        }
    }, [profile])

    // Fetch data in the background if not available
    useEffect(() => {
        if (!profile) {
            updateProfile()
                .then((fetchedProfile) => {
                    setLocalProfile(fetchedProfile)
                })
        }
    }, [profile, updateProfile])

    return <Profile
        profile={localProfile}
    />
}
