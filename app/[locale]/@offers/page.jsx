'use client'
import TwoColumnButtonList from '@/app/[locale]//components/TwoColumnButtonList'
import DropdownSelect from '@/app/[locale]/components/DropdownSelect'
import NumberTypeSelector from '@/app/[locale]/components/NumberTypeSelector'
import {getAreas, getCountries, getNumbers} from '@/app/api/redreport/offers'
import {Card} from 'flowbite-react'
import {useTranslations} from 'next-intl'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {useState} from 'react'
import useSWR from 'swr'

const types = [
    'voice', 'sms', 'tollfree', 'reg'
]

export default function Offers() {
    const router = useRouter()
    const pathName = usePathname()
    const searchParams = useSearchParams()

    const t = useTranslations('offers')
    const d = useTranslations('docs')

    const [numberInfo, setNumberInfo] = useState(null)
    const [loadingCountries, setLoadingCountries] = useState(false)
    const [loadingAreas, setLoadingAreas] = useState(false)
    const [loadingNumbers, setLoadingNumbers] = useState(false)

    function Countries() {
        const {data} = useSWR(searchParams.has('type') ? {
            type: searchParams.get('type'),
        } : null, getCountries)
        return data ?? []
    }

    function Areas() {
        const {data} = useSWR(searchParams.has('type') && searchParams.has('country') ? {
            type: searchParams.get('type'),
            country: searchParams.get('country')
        } : null, getAreas)
        if (data && data.length === 1) {
            router.push(pathName + '?' + 'type=' + searchParams.get('type') + '&country=' + searchParams.get('country') + '&area=' + data[0].id)
        }
        return data ?? []
    }

    function Numbers() {
        const {data} = useSWR(searchParams.has('type') && searchParams.has('country') && searchParams.has('area') ? {
            type: searchParams.get('type'),
            country: searchParams.get('country'),
            area: searchParams.get('area'),
        } : null, getNumbers)
        return data ?? []
    }

    function GetDocs(numberInfo) {
        let res = ''
        const docs = JSON.parse(numberInfo.docs)
        for (const key in docs) {
            if (docs.hasOwnProperty(key) && docs[key] === 1) {
                res += d(key) + ' '
            }
        }
        return res
    }

    const handleType = async (t) => {
        setNumberInfo(null)
        setLoadingCountries(true)
        setLoadingAreas(false)
        router.push(pathName + '?' + 'type=' + t)
    }
    const handleCountry = async (country) => {
        setNumberInfo(null)
        setLoadingAreas(true)
        router.push(pathName + '?' + 'type=' + searchParams.get('type') + '&country=' + country)
    }
    const handleArea = async (area) => {
        setNumberInfo(null)
        router.push(pathName + '?' + 'type=' + searchParams.get('type') + '&country=' + searchParams.get('country') + '&area=' + area)
    }
    const handleNumber = async (number) => {
        setNumberInfo(number)
    }

    return (
        <>
            <Card id="offers" className="bg-gray-200 dark:bg-indigo-800">
                <NumberTypeSelector options={types} onSelect={handleType} selectedOption={searchParams.get('type')}/>
                <div className="flex flex-row items-center gap-4 justify-between my-4">
                    <DropdownSelect
                        selectId="country"
                        selectTitle={t('select_country')}
                        data={Countries()}
                        onSelect={handleCountry}
                        selectedOption={searchParams.get('country')}
                        loading={loadingCountries}
                    />
                    <DropdownSelect
                        selectId="area"
                        selectTitle={t('select_area')}
                        data={Areas()}
                        onSelect={handleArea}
                        selectedOption={searchParams.get('area')}
                        loading={loadingAreas}
                    />
                </div>
                <div className="flex items-center transition duration-300">
                    <TwoColumnButtonList
                        options={Numbers()}
                        onSelect={handleNumber}
                        selectedOption={searchParams.get('number')}
                    />
                </div>
                <div className="flex flex-col px-2 transition duration-300 text-gray-900 dark:text-gray-300">
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