'use client'
import DropdownSelectGeo from '@/components/shared/DropdownSelectGeo'
import NumberTypeSelector from '@/components/NumberTypeSelector'
import {getAreas, getCountries, getNumbers} from '@/app/api/redreport/offers'
import { Card } from '@/components/ui/card'
import {useTranslations} from 'next-intl'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {useState} from 'react'
import useSWR from 'swr'
import {NumberInfo} from '@/types/NumberInfo'
import CQS from '@/utils/CreateQueryString'
import getSlug from '@/utils/getSlug'
import Show from '@/components/service/Show'
import dynamic from 'next/dynamic'
import React from 'react'

// Dynamically import components that are only needed conditionally
const NumberOffersList = dynamic(() => import('@/components/NumberOffersList'), {
    ssr: true,
    loading: () => <div className="animate-pulse h-40 bg-muted rounded-md"></div>
})

const BuyNumberForm = dynamic(() => import('@/components/BuyNumberForm'), {
    ssr: true,
    loading: () => <div className="animate-pulse h-60 bg-muted rounded-md"></div>
})

const numberTypes = [
    'voice', 'sms', 'tollfree', 'reg'
]

export default function OffersPage() {
    const router = useRouter()
    const pathName = usePathname()
    const searchParams = useSearchParams()

    const t = useTranslations('offers')

    //const [numberInfo, setNumberInfo] = usePersistState<NumberInfo | null>(null, 'numberInfo')
    const [loadingCountries, setLoadingCountries] = useState(false)
    const [loadingAreas, setLoadingAreas] = useState(false)
    const [loadingNumbers, setLoadingNumbers] = useState(false)

    // Use SWR hooks outside of render functions to prevent unnecessary re-renders
    const { data: countriesData = [] } = useSWR(
        searchParams.has('type') ? {
            type: searchParams.get('type'),
        } : null, 
        getCountries
    )

    const countries = countriesData
    const slugCountry = countries.find(e => getSlug(e.name) == searchParams.get('country'))
    const getCountry: number | null = searchParams.has('country') ?
        (!isNaN(+searchParams.get('country')!) ?
            Number(searchParams.get('country')) :
            (slugCountry ?
                Number(slugCountry.id) :
                null)) :
        null

    const { data: areasData = [] } = useSWR(
        searchParams.has('type') && getCountry !== null ? {
            type: searchParams.get('type'),
            country: getCountry
        } : null, 
        getAreas
    )

    // Handle auto-selection of area when there's only one option
    React.useEffect(() => {
        if (
            areasData &&
            areasData.length === 1 &&
            !searchParams.has('area')
        ) {
            router.push(pathName + '?' + CQS('area', areasData[0].id, searchParams))
        }
    }, [areasData, pathName, router, searchParams])

    const areas = areasData
    const slugArea = areas.find(e => getSlug(e.name) == searchParams.get('area'))
    const getArea: number | null = searchParams.has('area') ?
        (!isNaN(+searchParams.get('area')!) ?
            Number(searchParams.get('area')) :
            (slugArea ?
                Number(slugArea.id) :
                null)) :
        null

    const { data: numbersData = [] } = useSWR(
        searchParams.has('type') && getCountry !== null && getArea !== null ?
            {
                type: searchParams.get('type'),
                country: getCountry,
                area: getArea,
            } :
            null, 
        getNumbers
    )

    const numbers = numbersData
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
    const handleCountry = async (value: number | string) => {
        //setNumberInfo(null)
        setLoadingAreas(true)
        setLoadingNumbers(false)
        const slug = countries.find(e => e.id == value)
        router.push(pathName + '?' + CQS('country', slug ? getSlug(slug.name) : value, searchParams, ['area', 'number']))
    }
    const handleArea = async (value: number | string) => {
        //setNumberInfo(null)
        setLoadingNumbers(true)
        router.push(pathName + '?' + CQS('area', value, searchParams, ['number']))
    }
    const handleNumber = async (number: NumberInfo) => {
        router.push(pathName + '?' + CQS('number', number.did, searchParams))
        //setNumberInfo(number)
    }

    return (
        <Card id="offers" className="bg-muted dark:bg-muted border border-border p-0">
            <NumberTypeSelector options={numberTypes} onSelectAction={handleType} selectedOption={searchParams.get('type')}/>
            <div className="flex flex-col md:flex-row items-center gap-4 justify-between my-4 px-6">
                <DropdownSelectGeo
                    selectId="country"
                    selectTitle={t('select_country')}
                    data={countries}
                    onSelectAction={handleCountry}
                    selectedOption={getCountry}
                    loading={loadingCountries}
                    customClass="w-full"
                />
                <DropdownSelectGeo
                    selectId="area"
                    selectTitle={t('select_area')}
                    data={areas}
                    onSelectAction={handleArea}
                    selectedOption={getArea}
                    loading={loadingAreas}
                    customClass="w-full"
                />
            </div>
            <div
                className="flex items-center transition duration-300 px-6"
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
                className="flex flex-col px-6 transition duration-300 text-foreground dark:text-foreground"
            >
                <Show when={typeof getNumber !== 'undefined' && getNumber !== null}>
                    {BuyNumberForm({
                        numberInfo: getNumber!,
                        countryId: getCountry,
                        areaCode: getArea,
                    })}
                </Show>
            </div>
        </Card>
    )
}
