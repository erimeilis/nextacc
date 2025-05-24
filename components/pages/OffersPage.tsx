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

    useEffect(() => {
        if (searchParams && !searchParams.has('type')) {
            // If no type is in the URL and this is an initial render, set voice as default
            router.push(pathName + '?' + CreateQueryString('type', 'voice', searchParams, ['country', 'area', 'number']))
        }
    }, [searchParams, pathName, router])

    const t = useTranslations('offers')

    //const [numberInfo, setNumberInfo] = usePersistState<NumberInfo | null>(null, 'numberInfo')

    const [localCountriesMap, setLocalCountriesMap] = useState<CountryInfo[] | null>([])
    const [localAreasMap, setLocalAreasMap] = useState<AreaInfo[] | null>([])
    const [localNumbersMap, setLocalNumbersMap] = useState<NumberInfo[] | null>([])
    const {countriesMap, areasMap, numbersMap, updateCountries, updateAreas, updateNumbers} = useOffersStore()
    const {cart} = useCartStore()

    const type = searchParams ? searchParams.get('type') : null
    const countryBySlug = (searchParams && searchParams.has('country')) ?
        (localCountriesMap?.find(e =>
            getSlug(e.countryname) == searchParams.get('country'))) :
        null
    const country = (searchParams && searchParams.has('country')) ?
        (!isNaN(+(searchParams.get('country') || '')) ?
            Number(searchParams.get('country')) :
            (countryBySlug ?
                Number(countryBySlug.id) :
                null)) :
        null
    const areaBySlug = (searchParams && searchParams.has('area')) ?
        (localAreasMap?.find(e =>
            getSlug(e.areaname) == searchParams.get('area'))) :
        null
    const area = (searchParams && searchParams.has('area')) ?
        (!isNaN(+(searchParams.get('area') || '')) ?
            Number(searchParams.get('area')) :
            (areaBySlug ?
                Number(areaBySlug.areaprefix) :
                null)) :
        null
    const number = (searchParams && searchParams.has('number')) ?
        searchParams.get('number') :
        null

    useEffect(() => {
        if (type) {
            // Initial load of countries - set from store if available
            if (countriesMap[type!]) {
                setLocalCountriesMap(countriesMap[type!])
            } else {
                // Only fetch if not available
                updateCountries(type!)
                    .then((fetchedCountries) => {
                        setLocalCountriesMap(fetchedCountries)
                    })
            }

            if (country) {
                // Handle non-existable country selected
                if (!countriesMap[type!]?.some(c => c.id === country)) {
                    router.push(pathName + '?' + CreateQueryString('type', type!, searchParams, ['country', 'area', 'number']))
                    return
                }

                const cKey: string = `${type}_${country}`
                // Initial load of areas - set from store if available
                if (areasMap[cKey]) {
                    setLocalAreasMap(areasMap[cKey])
                    // Handle auto-selection of area when there's only one option
                    if (areasMap[cKey]?.length === 1 && !searchParams?.has('area')) {
                        router.push(pathName + '?' + CreateQueryString('area', areasMap[cKey][0]?.areaprefix, searchParams))
                    }
                } else {
                    // Only fetch if not available
                    updateAreas(type!, country)
                        .then((fetchedAreas) => {
                            setLocalAreasMap(fetchedAreas)
                            // Handle auto-selection of area when there's only one option
                            if (fetchedAreas.length === 1 && !searchParams?.has('area')) {
                                router.push(pathName + '?' + CreateQueryString('area', fetchedAreas[0]?.areaprefix, searchParams))
                            }
                        })
                }

                if (area) {
                    const aKey: string = `${type}_${country}_${area}`
                    // Initial load of numbers - set from store if available
                    if (numbersMap[aKey]) {
                        setLocalNumbersMap(numbersMap[aKey])
                    } else {
                        // Only fetch if not available
                        updateNumbers(type!, country, area)
                            .then((fetchedNumbers) => {
                                setLocalNumbersMap(fetchedNumbers)
                            })
                    }
                }
            }
        }
    }, [area, areasMap, countriesMap, country, numbersMap, pathName, router, searchParams, type, updateAreas, updateCountries, updateNumbers])

    const countries = localCountriesMap ?
        localCountriesMap.map(country => ({
            id: country.id,
            name: country.countryname + ' +' + country.countryprefix.toString(),
        })) :
        null
    const areas = localAreasMap ?
        localAreasMap.map(area => ({
            id: area.areaprefix,
            name: '(' + area.areaprefix.toString() + ') ' + area.areaname,
        })) :
        null
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
        null
    const getNumber: NumberInfo | null = number ?
        (numbers?.find(e => e.did == number) ?? null) :
        null

    const handleType = (t: string) => {
        setLocalAreasMap([])
        setLocalNumbersMap(null)

        // Delay URL update to allow the dropdown to update visually first
        setTimeout(() => {
            router.push(pathName + '?' + CreateQueryString('type', t, searchParams, ['area', 'number']))
            // Fetch updated countries in the background
            updateCountries(t).then((fetchedCountries) => {
                setLocalCountriesMap(fetchedCountries)
            })
        }, 50); // Small delay to ensure visual update happens first
    }
    const handleCountry = (value: number | string) => {
        setLocalAreasMap(null)
        const slug = countries?.find(e => e.id == value)

        // Delay URL update to allow the dropdown to update visually first
        setTimeout(() => {
            router.push(pathName + '?' + CreateQueryString('country', slug ? getSlug(slug.name) : value, searchParams, ['area', 'number']))

            console.log('handleCountry', value, slug)
            // If type and country are valid, fetch updated areas in the background
            if (type && value) {
                const newCountryBySlug = localCountriesMap?.find(e =>
                    getSlug(e.countryname) == value)
                const newCountry = !isNaN(+(value || '')) ?
                    Number(value) :
                    (newCountryBySlug ?
                        Number(newCountryBySlug?.id) :
                        null)
                if (newCountry) {
                    // If areas already exist, set them immediately
                    const cKey: string = `${type}_${newCountry}`
                    if (areasMap[cKey]) {
                        setLocalAreasMap(areasMap[cKey]) //todo check but guess we don't need that
                    }
                    // Then fetch updated areas in the background
                    updateAreas(type, newCountry).then((fetchedAreas) => {
                        setLocalAreasMap(fetchedAreas)
                    })
                }
            }
        }, 50); // Small delay to ensure visual update happens first
    }
    const handleArea = (value: number | string) => {
        setLocalNumbersMap(null)

        // Delay URL update to allow the dropdown to update visually first
        setTimeout(() => {
            router.push(pathName + '?' + CreateQueryString('area', value, searchParams, ['number']))

            // If type, country, and area are valid, fetch updated numbers in the background
            if (type && country && value) {
                const newAreaBySlug = localAreasMap?.find(e =>
                    getSlug(e.areaname) == value)
                const newArea = !isNaN(+(value || '')) ?
                    Number(value) :
                    (areaBySlug ?
                        Number(newAreaBySlug?.areaprefix) :
                        null)
                if (newArea) {
                    // If numbers already exist, set them immediately
                    const aKey: string = `${type}_${country}_${newArea}`
                    if (numbersMap[aKey]) {
                        setLocalNumbersMap(numbersMap[aKey]) //todo check but guess we don't need that
                    }
                    // Then fetch updated numbers in the background
                    updateNumbers(type, country, newArea).then((fetchedNumbers) => {
                        setLocalNumbersMap(fetchedNumbers)
                    })
                }
            }
        }, 50); // Small delay to ensure visual update happens first
    }
    const handleNumber = (number: NumberInfo) => {
        // Delay URL update to allow the selection to update visually first
        setTimeout(() => {
            router.push(pathName + '?' + CreateQueryString('number', number.did, searchParams))
        }, 50); // Small delay to ensure visual update happens first
    }

    return (
        <Card id="offers"
              className="bg-gradient-to-br from-secondary to-background dark:bg-gradient-to-br dark:from-secondary dark:to-background border border-border p-0 pb-6 sm:pb-8 overflow-hidden w-full">
            <NumberTypeSelector options={numberTypes} onSelectAction={handleType} selectedOption={type}/>
            <div className="flex flex-col md:flex-row items-center gap-4 justify-between my-4 px-4 sm:px-6">
                <DropdownSelectGeo
                    selectId="country"
                    selectTitle={t('select_country')}
                    data={countries}
                    onSelectAction={handleCountry}
                    selectedOption={country}
                    customClass="w-full"
                />
                <DropdownSelectGeo
                    selectId="area"
                    selectTitle={t('select_area')}
                    data={areas}
                    onSelectAction={handleArea}
                    selectedOption={area}
                    customClass="w-full"
                />
            </div>
            <div
                className="flex items-center transition duration-300 px-4 sm:px-6 overflow-hidden"
                style={{
                    display: (searchParams &&
                        searchParams.has('type') &&
                        searchParams.has('country') &&
                        searchParams.has('area')) ? 'block' : 'none'
                }}
            >
                <NumberOffersList
                    options={numbers}
                    onSelectAction={handleNumber}
                    selectedOption={number ?? null}
                />
            </div>
            <div
                className="flex flex-col px-4 sm:px-6 transition duration-300 text-foreground dark:text-foreground overflow-hidden"
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
