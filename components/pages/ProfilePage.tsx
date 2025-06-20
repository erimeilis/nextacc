'use client'
import Profile from '@/components/Profile'
import {useClientStore} from '@/stores/useClientStore'
import {useEffect, useState, useRef} from 'react'
import {UserProfile} from '@/types/UserProfile'

export default function ProfilePage() {
    const [localProfile, setLocalProfile] = useState<UserProfile | null>(null)
    const {getProfile, updateProfile} = useClientStore()
    const profile = getProfile()
    const backgroundFetchDone = useRef(false)

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

    // Fetch data in background even when it exists, but only once per page visit
    useEffect(() => {
        if (profile && !backgroundFetchDone.current) {
            backgroundFetchDone.current = true
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
