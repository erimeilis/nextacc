'use client'
import Profile from '@/components/Profile'
import {useClientStore} from '@/stores/useClientStore'
import {useEffect, useState} from 'react'
import {UserProfile} from '@/types/UserProfile'

export default function ProfilePage() {
    const [profileState, setProfileState] = useState<UserProfile | null>(null)
    const {profile, updateProfile} = useClientStore()
    useEffect(() => {
        if (!profile) {
            updateProfile()
        }
    }, [profile, updateProfile])

    useEffect(() => {
        setProfileState(profile)
    }, [profile])

    return <Profile
        profile={profileState}
    />
}