'use client'
import NumberOffersList from '@/app/[locale]/components/NumberOffersList'
import DropdownSelect from '@/app/[locale]/components/DropdownSelect'
import NumberTypeSelector from '@/app/[locale]/components/NumberTypeSelector'
import {getAreas, getCountries, getNumbers} from '@/app/api/redreport/offers'
import {Card} from 'flowbite-react'
import {useTranslations} from 'next-intl'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {useState} from 'react'
import useSWR from 'swr'
import {NumberInfo} from '@/app/api/types/NumberInfo'

const numberTypes = [
    'voice', 'sms', 'tollfree', 'reg'
]

export default function Page() {
    const router = useRouter()
    const pathName = usePathname()
    const searchParams = useSearchParams()

    const t = useTranslations('offers')
    const d = useTranslations('docs')

    const [numberInfo, setNumberInfo] = useState<NumberInfo | null>(null)
    const [loadingCountries, setLoadingCountries] = useState(false)
    const [loadingAreas, setLoadingAreas] = useState(false)
    const [loadingNumbers, setLoadingNumbers] = useState(false)

    function Countries(): { id: number, name: string }[] {
        const {data} = useSWR(searchParams.has('type') ? {
            type: searchParams.get('type'),
        } : null, getCountries, {})
        return data ?? []
    }

    function Areas(): { id: number, name: string }[] {
        const {data} = useSWR(searchParams.has('type') && searchParams.has('country') ? {
            type: searchParams.get('type'),
            country: searchParams.get('country')
        } : null, getAreas, {})
        if (
            data &&
            data.length === 1 &&
            !searchParams.has('area')
        ) {
            router.push(pathName + '?' + 'type=' + searchParams.get('type') + '&country=' + searchParams.get('country') + '&area=' + data[0].id)
        }
        return data ?? []
    }

    function Numbers(): NumberInfo[] {
        const {data} = useSWR(searchParams.has('type') && searchParams.has('country') && searchParams.has('area') ?
            {
                type: searchParams.get('type'),
                country: parseInt(searchParams.get('country')!),
                area: parseInt(searchParams.get('area')!),
            } :
            null, getNumbers, {})
        return data ?? []
    }

    function GetDocs(numberInfo: NumberInfo) {
        let res = ''
        const docs = JSON.parse(numberInfo.docs as string)
        for (const key in docs) {
            if (docs.hasOwnProperty(key) && docs[key] === 1) {
                res += d(key) + ' '
            }
        }
        return res
    }

    const handleType = async (t: string) => {
        setNumberInfo(null)
        setLoadingCountries(true)
        setLoadingAreas(false)
        setLoadingNumbers(false)
        router.push(pathName + '?' + 'type=' + t)
    }
    const handleCountry = async (value: number) => {
        setNumberInfo(null)
        setLoadingAreas(true)
        setLoadingNumbers(false)
        router.push(pathName + '?' + 'type=' + searchParams.get('type') + '&country=' + value)
    }
    const handleArea = async (value: number) => {
        setNumberInfo(null)
        setLoadingNumbers(true)
        router.push(pathName + '?' + 'type=' + searchParams.get('type') + '&country=' + searchParams.get('country') + '&area=' + value)
    }
    const handleNumber = async (number: NumberInfo) => {
        setNumberInfo(number)
    }

    return (
        <>
            <Card id="offers" className="bg-gray-200 dark:bg-indigo-800">
                <NumberTypeSelector options={numberTypes} onSelectAction={handleType} selectedOption={searchParams.get('type')}/>
                <div className="flex flex-row items-center gap-4 justify-between my-4">
                    <DropdownSelect
                        selectId="country"
                        selectTitle={t('select_country')}
                        data={Countries()}
                        onSelectAction={handleCountry}
                        selectedOption={searchParams.get('country')}
                        loading={loadingCountries}
                    />
                    <DropdownSelect
                        selectId="area"
                        selectTitle={t('select_area')}
                        data={Areas()}
                        onSelectAction={handleArea}
                        selectedOption={searchParams.get('area')}
                        loading={loadingAreas}
                    />
                </div>
                <div
                    className="flex items-center transition duration-300"
                    style={{display: (searchParams.has('type') && searchParams.has('country') && searchParams.has('area')) ? 'block' : 'none'}}
                >
                    <NumberOffersList
                        options={Numbers()}
                        onSelectAction={handleNumber}
                        selectedOption={searchParams.get('number')}
                        loading={loadingNumbers}
                    />
                </div>
                <div
                    className="flex flex-col px-2 transition duration-300 text-gray-900 dark:text-gray-300"
                >
                    <div>
                        {(numberInfo) ? t('setupfee') + ': ' + numberInfo.setuprate + '$ / '
                            + t('monthlyfee') + ': ' + numberInfo.fixrate + '$' : ''}
                    </div>
                    <div>
                        {(numberInfo) ? GetDocs(numberInfo) : ''}
                    </div>
                </div>
            </Card>
        </>
    )
}