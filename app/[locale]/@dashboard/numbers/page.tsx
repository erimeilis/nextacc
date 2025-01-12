'use server'
import {redGetMyNumbers} from '@/app/api/redreport/numbers'
import MyNumbersList from '@/components/MyNumbersList' // Assuming that it's imported correctly

export default async function Page() {
    const numbers = await redGetMyNumbers()

    return (
        <MyNumbersList
            options={numbers}
        />
    )
}