'use client'
import DropdownSelectGeo from '@/components/shared/DropdownSelectGeo'
import NumberTypeSelector from '@/components/NumberTypeSelector'
import {Card} from '@/components/ui/card'
import {useTranslations} from 'next-intl'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import React, {useEffect, useState} from 'react'
import {NumberInfo} from '@/types/NumberInfo'
import CreateQueryString from '@/utils/CreateQueryString'
import getSlug from '@/utils/getSlug'
import Show from '@/components/service/Show'
import dynamic from 'next/dynamic'
import {useCartStore} from '@/stores/useCartStore'
import {numberTypes} from '@/constants/numberTypes'
import {useOffersStore} from '@/stores/useOffersStore'
import {CountryInfo} from '@/types/CountryInfo'
import {AreaInfo} from '@/types/AreaInfo'

// Dynamically import components that are only needed conditionally
const NumberOffersList = dynamic(() => import('@/components/NumberOffersList'), {
    ssr: true,
    loading: () => <div className="animate-pulse h-40 bg-muted rounded-md"></div>
})

const BuyNumberForm = dynamic(() => import('@/components/BuyNumberForm'), {
    ssr: true,
    loading: () => <div className="animate-pulse h-60 bg-muted rounded-md"></div>
})

export default function OffersPage() {
    const router = useRouter()
    const pathName = usePathname()
    const searchParams = useSearchParams()

    const t = useTranslations('offers')

    //const [numberInfo, setNumberInfo] = usePersistState<NumberInfo | null>(null, 'numberInfo')
    const [loadingCountries, setLoadingCountries] = useState(false)
    const [loadingAreas, setLoadingAreas] = useState(false)
    const [loadingNumbers, setLoadingNumbers] = useState(false)

    const [type, setType] = useState<string | null>(null)
    const [country, setCountry] = useState<number | null>(null)
    const [area, setArea] = useState<number | null>(null)
    const [number, setNumber] = useState<string | null>(null)

    const [localCountriesMap, setLocalCountriesMap] = useState<CountryInfo[]>([])
    const [localAreasMap, setLocalAreasMap] = useState<AreaInfo[]>([])
    const [localNumbersMap, setLocalNumbersMap] = useState<NumberInfo[]>([])
    const {countriesMap, areasMap, numbersMap, updateCountries, updateAreas, updateNumbers} = useOffersStore()

    useEffect(() => {
        if (searchParams) {
            // If no type is in the URL and this is an initial render, set voice as default
            if (searchParams.has('type')) {
                setType(searchParams.get('type'))
            } else {
                router.push(pathName + '?' + CreateQueryString('type', 'voice', searchParams))
            }
            if (searchParams.has('country')) {
                const countryBySlug = localCountriesMap?.find(e =>
                    getSlug(e.countryname) == searchParams.get('country'))
                setCountry(!isNaN(+(searchParams.get('country') || '')) ?
                    Number(searchParams.get('country')) :
                    (countryBySlug ?
                        Number(countryBySlug.id) :
                        null))
            } else {
                setCountry(null)
            }
            if (searchParams.has('area')) {
                const areaBySlug = localAreasMap?.find(e =>
                    getSlug(e.areaname) == searchParams.get('area'))
                setArea(!isNaN(+(searchParams.get('area') || '')) ?
                    Number(searchParams.get('area')) :
                    (areaBySlug ?
                        Number(areaBySlug.areaprefix) :
                        null))
            } else {
                setArea(null)
            }
            if (searchParams.has('number')) {
                setNumber(searchParams.get('number'))
            } else {
                setNumber(null)
            }
        }
    }, [localAreasMap, localCountriesMap, pathName, router, searchParams])

    // Get data from the Offers store
    useEffect(() => {
        if (searchParams && searchParams.has('type')) {
            if (!countriesMap[searchParams.get('type')!]) {
                updateCountries(searchParams.get('type')!)
            }
            setLocalCountriesMap(countriesMap[searchParams.get('type')!])
            if (country) {
                // Handle non-existable country selected
                if (!countriesMap[searchParams.get('type')!]?.some(c => c.id === country)) {
                    router.push(pathName + '?' + CreateQueryString('type', searchParams.get('type')!, searchParams, ['country', 'area', 'number']))
                }
                const cKey: string = `${searchParams.get('type')}_${country}`
                if (!areasMap[cKey]) {
                    updateAreas(searchParams.get('type')!, country)
                }
                setLocalAreasMap(areasMap[cKey])
                // Handle auto-selection of area when there's only one option
                if (areasMap[cKey]?.length === 1) {
                    router.push(pathName + '?' + CreateQueryString('area', areasMap[cKey][0]?.areaprefix, searchParams))
                }
                if (area) {
                    const aKey: string = `${searchParams.get('type')}_${country}_${area}`
                    if (!numbersMap[aKey]) {
                        updateNumbers(searchParams.get('type')!, country, area)
                    }
                    setLocalNumbersMap(numbersMap[aKey])
                }
            }
        }
    }, [country, area, countriesMap, areasMap, numbersMap, updateCountries, updateAreas, updateNumbers, router, pathName, searchParams])

    const countries = localCountriesMap ?
        localCountriesMap.map(country => ({
            id: country.id,
            name: country.countryname + ' +' + country.countryprefix.toString(),
        })) :
        []
    const areas = localAreasMap ?
        localAreasMap.map(area => ({
            id: area.areaprefix,
            name: '(' + area.areaprefix.toString() + ') ' + area.areaname,
        })) :
        []

    const {cart} = useCartStore()
    const numbers = localNumbersMap ?
        localNumbersMap.filter(number => {
            // Check if this number exists in the cart and has a numeric DID
            const existsInCart = cart.some(cartItem => {
                // Check if cartItem.did is numeric
                const isNumeric = /^\d+$/.test(cartItem.did)
                // If it's numeric and matches the current number's did, return true (this item is in the cart)
                return isNumeric && cartItem.did === number.did
            })
            // Return true only for numbers NOT in the cart (filter those out)
            return !existsInCart
        }) :
        []
    const getNumber: NumberInfo | null = number ?
        (numbers.find(e => e.did == number) ?? null) :
        null

    const handleType = async (t: string) => {
        //setNumberInfo(null)
        setLoadingCountries(true)
        setLoadingAreas(false)
        setLoadingNumbers(false)
        router.push(pathName + '?' + CreateQueryString('type', t, searchParams, ['area', 'number']))
    }
    const handleCountry = async (value: number | string) => {
        //setNumberInfo(null)
        setLoadingAreas(true)
        setLoadingNumbers(false)
        const slug = countries.find(e => e.id == value)
        router.push(pathName + '?' + CreateQueryString('country', slug ? getSlug(slug.name) : value, searchParams, ['area', 'number']))
    }
    const handleArea = async (value: number | string) => {
        //setNumberInfo(null)
        setLoadingNumbers(true)
        router.push(pathName + '?' + CreateQueryString('area', value, searchParams, ['number']))
    }
    const handleNumber = async (number: NumberInfo) => {
        router.push(pathName + '?' + CreateQueryString('number', number.did, searchParams))
        //setNumberInfo(number)
    }

    return (
        <Card id="offers"
              className="bg-gradient-to-br from-secondary to-background dark:bg-gradient-to-br dark:from-secondary dark:to-background border border-border p-0 pb-8 overflow-hidden">
            <NumberTypeSelector options={numberTypes} onSelectAction={handleType} selectedOption={type}/>
            <div className="flex flex-col md:flex-row items-center gap-4 justify-between my-4 px-6">
                <DropdownSelectGeo
                    selectId="country"
                    selectTitle={t('select_country')}
                    data={countries}
                    onSelectAction={handleCountry}
                    selectedOption={country}
                    loading={loadingCountries}
                    customClass="w-full"
                />
                <DropdownSelectGeo
                    selectId="area"
                    selectTitle={t('select_area')}
                    data={areas}
                    onSelectAction={handleArea}
                    selectedOption={area}
                    loading={loadingAreas}
                    customClass="w-full"
                />
            </div>
            <div
                className="flex items-center transition duration-300 px-6 overflow-hidden"
                style={{
                    display: (type && country && area) ? 'block' : 'none'
                }}
            >
                <NumberOffersList
                    options={numbers}
                    onSelectAction={handleNumber}
                    selectedOption={number ?? null}
                    loading={loadingNumbers}
                />
            </div>
            <div
                className="flex flex-col px-6 transition duration-300 text-foreground dark:text-foreground overflow-hidden"
            >
                <Show when={typeof getNumber !== 'undefined' && getNumber !== null}>
                    <BuyNumberForm
                        numberInfo={getNumber!}
                        countryId={country}
                        areaCode={area}
                    />
                </Show>
            </div>
        </Card>
    )
}
