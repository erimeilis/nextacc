import {Tab} from '@/types/Tab'
import {ChartPieSlice, SimCard, User} from '@phosphor-icons/react'

const profileTabs: Tab[] = [
    {
        name: 'profile',
        slug: 'profile',
        icon: User,
    },
    {
        name: 'transactions',
        slug: 'transactions',
        icon: ChartPieSlice
    },
    {
        name: 'numbers',
        slug: 'numbers',
        icon: SimCard
    },
]
export {profileTabs}