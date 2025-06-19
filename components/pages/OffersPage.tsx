'use client'
import DropdownSelectGeo from '@/components/shared/DropdownSelectGeo'
import NumberTypeSelector from '@/components/NumberTypeSelector'
import {Card} from '@/components/ui/Card'
import {useTranslations} from 'next-intl'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import React, {useCallback, useEffect, useRef, useState} from 'react'
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
import Loader from '@/components/service/Loader'

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
    const [localCountriesMap, setLocalCountriesMap] = useState<CountryInfo[] | null>([])
    const [localAreasMap, setLocalAreasMap] = useState<AreaInfo[] | null>([])
    const [localNumbersMap, setLocalNumbersMap] = useState<NumberInfo[] | null>([])
    const {countriesMap, areasMap, numbersMap, updateCountries, updateAreas, updateNumbers} = useOffersStore()
    const {cart} = useCartStore()
    const buyForm = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (searchParams && !searchParams.has('type')) {
            // If no type is in the URL and this is an initial render, set voice as default
            router.push(pathName + '?' + CreateQueryString('type', 'voice', searchParams, ['country', 'area', 'number']))
        }
        if (searchParams && !searchParams.has('area')) {
            setLocalNumbersMap(null)
        }
        if (searchParams &&
            searchParams.has('number') &&
            localNumbersMap &&
            (
                !localNumbersMap.some(numberInfo => numberInfo.did === searchParams.get('number')) ||
                cart.some(cartItem => {
                    // Check if cartItem.did is numeric
                    const isNumeric = /^\d+$/.test(cartItem.did)
                    // If it's numeric and matches the current number's did, return true (this item is in the cart)
                    return isNumeric && cartItem.did === searchParams.get('number')
                }))
        ) {
            // If the number is not in the localNumbersMap (not available), redirect to a path without a number
            router.push(pathName + '?' + CreateQueryString('', '', searchParams, ['number']))
        }
    }, [searchParams, pathName, router, localNumbersMap, cart])

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

    const handleNumber = useCallback((number: NumberInfo) => {
        router.push(pathName + '?' + CreateQueryString('number', number.did, searchParams))
    }, [pathName, router, searchParams])

    const handleArea = useCallback((area: number | string) => {
        if (type && country) {
            const newArea = (searchParams && searchParams.has('area')) ?
                (!isNaN(+(searchParams.get('area') || '')) ?
                    Number(searchParams.get('area')) :
                    (areaBySlug ?
                        Number(areaBySlug.areaprefix) :
                        null)) :
                null
            if (newArea) {
                updateNumbers(type!, country, newArea)
                    .then((fetchedNumbers) => {
                        setLocalNumbersMap(fetchedNumbers)
                        // Auto-select the only number if there's just one
                        if (fetchedNumbers.length === 1 &&
                            !searchParams?.has('number') &&
                            fetchedNumbers.at(0) !== undefined) {
                            handleNumber(fetchedNumbers.at(0)!)
                        }
                    })
            }
        }
        router.push(pathName + '?' + CreateQueryString('area', area, searchParams, ['number']))
    }, [areaBySlug, country, handleNumber, pathName, router, searchParams, type, updateNumbers])

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
                    if (areasMap[cKey]?.length === 1 &&
                        !searchParams?.has('area') &&
                        areasMap[cKey].at(0) !== undefined
                    ) {
                        handleArea(areasMap[cKey].at(0)!.areaprefix)
                    }
                } else {
                    // Only fetch if not available
                    updateAreas(type!, country)
                        .then((fetchedAreas) => {
                            setLocalAreasMap(fetchedAreas)
                            // Handle auto-selection of area when there's only one option
                            if (fetchedAreas.length === 1 &&
                                !searchParams?.has('area') &&
                                fetchedAreas.at(0) !== undefined
                            ) {
                                handleArea(fetchedAreas.at(0)!.areaprefix)
                            }
                        })
                }

                if (area) {
                    const aKey: string = `${type}_${country}_${area}`
                    // Initial load of numbers - set from store if available
                    if (numbersMap[aKey]) {
                        setLocalNumbersMap(numbersMap[aKey])
                        // Auto-select the only number if there's just one
                        if (numbersMap[aKey].length === 1 &&
                            !searchParams?.has('number') &&
                            numbersMap[aKey].at(0) !== undefined) {
                            handleNumber(numbersMap[aKey].at(0)!)
                        }
                    } else {
                        // Only fetch if not available
                        updateNumbers(type!, country, area)
                            .then((fetchedNumbers) => {
                                setLocalNumbersMap(fetchedNumbers)
                                // Auto-select the only number if there's just one
                                if (fetchedNumbers.length === 1 &&
                                    !searchParams?.has('number') &&
                                    fetchedNumbers.at(0) !== undefined) {
                                    handleNumber(fetchedNumbers.at(0)!)
                                }
                            })
                    }
                } else {
                    // Clear the number list when an area is not selected
                    setLocalNumbersMap(null)
                }
            } else {
                // Clear both area and number lists when a country is not selected
                setLocalAreasMap(null)
                setLocalNumbersMap(null)
            }
        } else {
            // Clear all lists when a type is not selected
            setLocalCountriesMap(null)
            setLocalAreasMap(null)
            setLocalNumbersMap(null)
        }
    }, [area, areasMap, countriesMap, country, handleArea, handleNumber, numbersMap, pathName, router, searchParams, type, updateAreas, updateCountries, updateNumbers])

    const countries = localCountriesMap ?
        localCountriesMap.map(country => ({
            id: country.id,
            name: country.countryname + ' +' + country.countryprefix.toString(),
        })) :
        null
    const handleCountry = useCallback((country: number | string) => {
        const slug = countries?.find(e => e.id == country)
        const countryParam = slug ? getSlug(slug.name) : country
        if (type) {
            const newCountry = (searchParams && searchParams.has('country')) ?
                (!isNaN(+(searchParams.get('country') || '')) ?
                    Number(searchParams.get('country')) :
                    (countryBySlug ?
                        Number(countryBySlug.id) :
                        null)) :
                null
            if (newCountry) {
                updateAreas(type!, newCountry)
                    .then((fetchedAreas) => {
                        setLocalAreasMap(fetchedAreas)
                        // Handle auto-selection of area when there's only one option
                        if (fetchedAreas.length === 1 &&
                            !searchParams?.has('area') &&
                            fetchedAreas.at(0) !== undefined
                        ) {
                            handleArea(fetchedAreas.at(0)!.areaprefix)
                        }
                    })
            }
        }
        router.push(pathName + '?' + CreateQueryString('country', countryParam, searchParams, ['area', 'number']))
    }, [countries, countryBySlug, handleArea, pathName, router, searchParams, type, updateAreas])

    const handleType = useCallback((t: string) => {
        updateCountries(t)
            .then((fetchedCountries) => {
                setLocalCountriesMap(fetchedCountries)
            })
        router.push(pathName + '?' + CreateQueryString('type', t, searchParams, ['area', 'number']))
    }, [pathName, router, searchParams, updateCountries])

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


    // Effect to handle number selection and scrolling
    useEffect(() => {
        buyForm.current?.scrollIntoView({
            behavior: 'smooth'
        })
    }, [getNumber])

    return (
        <Card id="offers"
              className="rounded-none sm:rounded-lg bg-gradient-to-br from-secondary to-background dark:bg-gradient-to-br dark:from-secondary dark:to-background
              border-none sm:border border-border p-0 pb-6 sm:pb-8 overflow-hidden w-full">
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
                className="flex items-center transition-all duration-300 px-4 sm:px-6 overflow-hidden"
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
            <section ref={buyForm} id="buyForm" className="pt-1">
                <div
                    className="flex flex-col px-4 sm:px-6 transition-all duration-500 ease-in-out text-foreground dark:text-foreground"
                    style={{
                        display: (searchParams &&
                            searchParams.has('type') &&
                            searchParams.has('country') &&
                            searchParams.has('area') &&
                            searchParams.has('number')) ? 'block' : 'none'
                    }}
                >
                    <Show when={typeof getNumber !== 'undefined' && getNumber !== null}
                          fallback={<Loader height={32}/>}>
                        <div className="animate-in fade-in duration-700 ease-in-out">
                            <BuyNumberForm
                                numberInfo={getNumber!}
                                countryId={country}
                                areaCode={area}
                                countriesMap={localCountriesMap}
                                areasMap={localAreasMap}
                            />
                        </div>
                    </Show>
                </div>
            </section>
        </Card>
    )
}
