'use client'

import Profile from '@/components/Profile'
import { useProfile } from '@/hooks/queries/use-profile'
import { ProfileSkeleton } from '@/components/service/SkeletonLoader'

export default function ProfilePage() {
    const { data: profile, isLoading, error } = useProfile()

    // Show skeleton while loading
    if (isLoading) {
        return <ProfileSkeleton />
    }

    // Show error state
    if (error) {
        return (
            <div className="text-center py-8 text-destructive">
                <p>Failed to load profile: {error.message}</p>
            </div>
        )
    }

    // Profile component handles null case with its own fallback
    return <Profile profile={profile ?? null} />
}
