'use client'
import NumberOffersList from '@/components/NumberOffersList'
import DropdownSelect from '@/components/shared/DropdownSelect'
import NumberTypeSelector from '@/components/NumberTypeSelector'
import {getAreas, getCountries, getNumbers} from '@/app/api/redreport/offers'
import {Card} from 'flowbite-react'
import {useTranslations} from 'next-intl'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {useState} from 'react'
import useSWR from 'swr'
import {NumberInfo} from '@/types/NumberInfo'
import CQS from '@/utils/CreateQueryString'
import getSlug from '@/utils/getSlug'
import Show from '@/components/service/Show'
import BuyNumberForm from '@/components/BuyNumberForm'

const numberTypes = [
    'voice', 'sms', 'tollfree', 'reg'
]

export default function Page() {
    const router = useRouter()
    const pathName = usePathname()
    const searchParams = useSearchParams()

    const t = useTranslations('offers')

    //const [numberInfo, setNumberInfo] = usePersistState<NumberInfo | null>(null, 'numberInfo')
    const [loadingCountries, setLoadingCountries] = useState(false)
    const [loadingAreas, setLoadingAreas] = useState(false)
    const [loadingNumbers, setLoadingNumbers] = useState(false)

    function Countries(): { id: string, name: string }[] {
        const {data} = useSWR(searchParams.has('type') ? {
            type: searchParams.get('type'),
        } : null, getCountries, {})
        return data ?? []
    }

    const countries = Countries()
    const slugCountry = countries.find(e => getSlug(e.name) == searchParams.get('country'))
    const getCountry = searchParams.has('country') ?
        (!isNaN(+searchParams.get('country')!) ?
            searchParams.get('country') :
            (slugCountry ?
                slugCountry.id :
                null)) :
        null

    function Areas(): { id: string, name: string }[] {
        const {data} = useSWR(searchParams.has('type') && searchParams.has('country') ? {
            type: searchParams.get('type'),
            //country: searchParams.get('country')
            country: getCountry
        } : null, getAreas, {})
        if (
            data &&
            data.length === 1 &&
            !searchParams.has('area')
        ) {
            router.push(pathName + '?' + CQS('area', data[0].id, searchParams))
        }
        return data ?? []
    }

    const areas = Areas()
    const slugArea = areas.find(e => getSlug(e.name) == searchParams.get('area'))
    const getArea = searchParams.has('area') ?
        (!isNaN(+searchParams.get('area')!) ?
            searchParams.get('area') :
            (slugArea ?
                slugArea.id :
                null)) :
        null

    function Numbers(): NumberInfo[] {
        const {data} = useSWR(searchParams.has('type') && searchParams.has('country') && searchParams.has('area') ?
            {
                type: searchParams.get('type'),
                //country: searchParams.get('country')
                country: getCountry,
                area: getArea,
            } :
            null, getNumbers, {})
        return data ?? []
    }

    const numbers = Numbers()
    const getNumber: NumberInfo | null = searchParams.has('number') ?
        (numbers.find(e => e.did == searchParams.get('number')) ?? null) :
        null

    const handleType = async (t: string) => {
        //setNumberInfo(null)
        setLoadingCountries(true)
        setLoadingAreas(false)
        setLoadingNumbers(false)
        router.push(pathName + '?' + CQS('type', t, searchParams, ['country', 'area', 'number']))
    }
    const handleCountry = async (value: string) => {
        //setNumberInfo(null)
        setLoadingAreas(true)
        setLoadingNumbers(false)
        const slug = countries.find(e => e.id == value)
        router.push(pathName + '?' + CQS('country', slug ? getSlug(slug.name) : value, searchParams, ['area', 'number']))
    }
    const handleArea = async (value: string) => {
        //setNumberInfo(null)
        setLoadingNumbers(true)
        router.push(pathName + '?' + CQS('area', value, searchParams, ['number']))
    }
    const handleNumber = async (number: NumberInfo) => {
        router.push(pathName + '?' + CQS('number', number.did, searchParams))
        //setNumberInfo(number)
    }

    return (
        <Card id="offers" className="bg-gray-200 dark:bg-indigo-800">
            <NumberTypeSelector options={numberTypes} onSelectAction={handleType} selectedOption={searchParams.get('type')}/>
            <div className="flex flex-row items-center gap-4 justify-between my-4">
                <DropdownSelect
                    selectId="country"
                    selectTitle={t('select_country')}
                    data={countries}
                    onSelectAction={handleCountry}
                    selectedOption={searchParams.get('country')}
                    loading={loadingCountries}
                    customClass="w-full"
                />
                <DropdownSelect
                    selectId="area"
                    selectTitle={t('select_area')}
                    data={Areas()}
                    onSelectAction={handleArea}
                    selectedOption={searchParams.get('area')}
                    loading={loadingAreas}
                    customClass="w-full"
                />
            </div>
            <div
                className="flex items-center transition duration-300"
                style={{display: (searchParams.has('type') && searchParams.has('country') && searchParams.has('area')) ? 'block' : 'none'}}
            >
                <NumberOffersList
                    options={numbers}
                    onSelectAction={handleNumber}
                    selectedOption={searchParams.get('number')}
                    loading={loadingNumbers}
                />
            </div>
            <div
                className="flex flex-col px-2 transition duration-300 text-gray-900 dark:text-gray-300"
            >
                <Show when={typeof getNumber !== 'undefined' && getNumber !== null}>
                    {BuyNumberForm({numberInfo: getNumber!})}
                </Show>
            </div>
        </Card>
    )
}