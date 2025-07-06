'use client'
import Profile from '@/components/Profile'
import {useClientStore} from '@/stores/useClientStore'
import {useEffect, useRef, useState} from 'react'
import {UserProfile} from '@/types/UserProfile'

export default function ProfilePage() {
    const [localProfile, setLocalProfile] = useState<UserProfile | null>(null)
    const {getProfile, fetchProfile} = useClientStore()
    const profile = getProfile()
    const backgroundFetchDone = useRef(false)

    // Set data from the store immediately if available and fetch in background if needed
    useEffect(() => {
        if (profile) {
            setLocalProfile(profile)
        }
        if (!profile || !backgroundFetchDone.current) {
            backgroundFetchDone.current = true
            fetchProfile()
                .then((fetchedProfile) => {
                    setLocalProfile(fetchedProfile)
                })
        }
    }, [profile, fetchProfile])

    return <Profile
        profile={localProfile}
    />
}
