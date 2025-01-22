'use server'
import {redGetMyNumbers} from '@/app/api/redreport/numbers'
import MyNumbersList from '@/components/MyNumbersList'
import {NumberInfo} from '@/types/NumberInfo' // Assuming that it's imported correctly

export default async function Page() {
    const numbers: NumberInfo[] = await redGetMyNumbers()

    return (
        <MyNumbersList
            options={numbers}
        />
    )
}