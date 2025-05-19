'use client'
import Profile from '@/components/Profile'
import {useClientStore} from '@/stores/useClientStore'
import {useEffect, useState} from 'react'
import {UserProfile} from '@/types/UserProfile'

export default function ProfilePage() {
    const [localProfile, setLocalProfile] = useState<UserProfile | null>(null)
    const {profile, updateProfile} = useClientStore()
    useEffect(() => {
        if (!profile) {
            updateProfile()
                .then(() => setLocalProfile(profile))
        } else
            setLocalProfile(profile)
    }, [profile, updateProfile])

    return <Profile
        profile={localProfile}
    />
}