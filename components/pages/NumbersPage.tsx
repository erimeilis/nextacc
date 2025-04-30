'use server'
import {redGetMyNumbers} from '@/app/api/redreport/numbers'
import MyNumbersList from '@/components/MyNumbersList'
import {NumberInfo} from '@/types/NumberInfo'

export default async function NumbersPage() {
    const numbers: NumberInfo[] = await redGetMyNumbers()

    return (
        <MyNumbersList
            options={numbers}
        />
    )
}