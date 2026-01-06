'use client'
import ActionButton from '@/components/forms/ActionButton'
import {signOut} from '@/lib/auth-client'
import {useTranslations} from 'next-intl'
import {UserProfile} from '@/types/UserProfile'
import {resetPersistentId} from '@/utils/resetPersistentId'
import LineInput from '@/components/forms/LineInput'
import DropdownSelect from '@/components/forms/DropdownSelect'
import {useClientStore} from '@/stores/useClientStore'
import {useCartStore} from '@/stores/useCartStore'
import {useUpdateProfile} from '@/hooks/queries/use-profile'
import {CheckCircleIcon, PenNibIcon, XIcon} from '@phosphor-icons/react'
import {useToast} from '@/hooks/use-toast'
import {ProfileSkeleton} from '@/components/ui/loading/SkeletonLoader'
import React, {ChangeEvent, SyntheticEvent, useState} from 'react'
import {InputField} from '@/types/InputField'
import {profileFields} from '@/constants/profileFields'
import Show from '@/components/ui/display/Show'
import {useSearchParams} from 'next/navigation'
import {Table, TableBody, TableCell, TableRow} from '@/components/ui/layout/Table'
import {Checkbox} from '@/components/ui/primitives/Checkbox'
import {Boolean} from '@/components/ui/display/Boolean'
import {CountryOption, getCountries} from '@/utils/getCountries'

const profileFieldsState: { [index: string]: string } = {}
profileFields.forEach((field: InputField) => profileFieldsState[field.id] = '')

// Get countries data for flags
const countries = getCountries()

// Function to find country by ISO-3 code
const findCountryByIso3 = (iso3Code: string): CountryOption | undefined => {
    return countries.find(country => country.id.toLowerCase() === iso3Code.toLowerCase())
}

export default function Profile({
                                    profile
                                }: {
    profile: UserProfile | null
}): React.ReactElement {
    const t = useTranslations('profile')
    const toastT = useTranslations('toast')
    const {toast} = useToast()

    const searchParams = useSearchParams()
    const search = searchParams && searchParams.size > 0 ? `?${searchParams.toString()}` : ''

    const {reset: resetClientStore} = useClientStore()
    const {reset: resetCartStore} = useCartStore()
    const updateProfile = useUpdateProfile()

    const [modeEditProfile, setModeEditProfile] = useState(false)
    const handleToggle = () => {
        setModeEditProfile(!modeEditProfile)
        setAbleButtonEditProfile(false)
    }
    const [ableButtonEditProfile, setAbleButtonEditProfile] = useState(false)

    const [profileState, setProfileState] = useState(profileFieldsState)

    // Debug: Log profile state whenever it changes
    React.useEffect(() => {
        console.log('Current profileState:', profileState)
    }, [profileState])

    const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
        console.log(`Input change: ${e.target.id} = ${e.target.value}`)
        setProfileState({...profileState, [e.target.id]: e.target.value})
        setAbleButtonEditProfile(true)
    }

    const handleCheckboxChange = (id: string, checked: boolean) => {
        console.log(`Checkbox change: ${id} = ${checked}`)
        setProfileState({...profileState, [id]: checked.toString()})
        setAbleButtonEditProfile(true)
    }

    const handleDropdownChange = (id: string, value: string) => {
        setProfileState({...profileState, [id]: value})
        setAbleButtonEditProfile(true)
    }

    const handleProfileSubmit = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault()

        const profileData = {
            phone: Number(profileState['profilePhone']),
            firstname: profileState['profileFirstname'],
            lastname: profileState['profileLastname'],
            company: profileState['profileCompany'],
            country: profileState['profileCountry'],
            address: profileState['profileAddress'],
            low_balance_notification: profileState['profileLowBalanceNotification'] === 'true',
            low_balance_edge: Number(profileState['profileLowBalanceEdge']),
            subscribe_news: profileState['profileSubscribeNews'] === 'true',
        }

        updateProfile.mutate(profileData, {
            onSuccess: () => {
                toast({
                    variant: 'success',
                    title: toastT('success_title'),
                    description: toastT('save_success'),
                    duration: 5000,
                })
                setModeEditProfile(false)
            },
            onError: (error) => {
                toast({
                    variant: 'destructive',
                    title: toastT('error_title'),
                    description: error.message || toastT('save_error'),
                    duration: 5000,
                })
            },
        })
    }

    // Use useEffect to update profileState when profile changes
    React.useEffect(() => {
        if (profile) {
            // Create a new state object to update all at once
            const newState = {...profileFieldsState} // Use the initial state object instead of current state
            let stateChanged = false

            // Force update for the fields we know should be there
            // This is a workaround to ensure these fields are always set
            if ('low_balance_notification' in profile) {
                const value = profile.low_balance_notification
                newState['profileLowBalanceNotification'] = value.toString()
                stateChanged = true
                console.log(`Force setting profileLowBalanceNotification to ${value.toString()} (original: ${value})`)
            }

            if ('low_balance_edge' in profile) {
                const value = profile.low_balance_edge
                newState['profileLowBalanceEdge'] = value.toString()
                stateChanged = true
                console.log(`Force setting profileLowBalanceEdge to ${value.toString()} (original: ${value})`)
            }

            if ('subscribe_news' in profile) {
                const value = profile.subscribe_news
                newState['profileSubscribeNews'] = value.toString()
                stateChanged = true
                console.log(`Force setting profileSubscribeNews to ${value.toString()} (original: ${value})`)
            }

            // Process all other fields normally
            profileFields.forEach((field: InputField) => {
                const shortId = field.id.split('profile')[1].toLowerCase()
                console.log(`Checking field ${field.id}, shortId: ${shortId}, exists in data: ${shortId in profile}`)

                // Skip the fields we already forced
                if (field.id === 'profileLowBalanceNotification' ||
                    field.id === 'profileLowBalanceEdge' ||
                    field.id === 'profileSubscribeNews') {
                    return
                }

                // Check if the field exists in the profile data (including boolean false values)
                if (shortId in profile) {
                    const value = profile[shortId as keyof UserProfile]
                    const valueStr = value?.toString() || ''
                    console.log(`Setting ${field.id} to ${valueStr} (original value: ${value})`) // Debug log

                    newState[field.id] = valueStr
                    stateChanged = true
                }
            })

            // Only update state if changes were made
            if (stateChanged) {
                console.log('Updating profileState with:', newState)
                setProfileState(newState)
            }
        }
    }, [profile]) // Remove profileState from dependencies

    const userProfile = profile

    //todo reset persistentID on logout?
    return <Show
        when={typeof userProfile !== 'undefined' && userProfile !== null}
        fallback={<ProfileSkeleton/>}>
        <div id="profile" className="transition duration-300 ease">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 pb-4 border-b border-border dark:border-border drop-shadow-sm">
                <div className="text-xs sm:text-sm px-2 text-center sm:text-left">{t('signed_in_as')} {userProfile?.email} ({userProfile?.id})
                </div>
                <div className="flex flex-row gap-2">
                    <ActionButton
                        onClick={() => {
                        }}
                        type="button"
                        className="text-xs sm:text-sm"
                    >
                        {t('balance')}: ${userProfile?.balance.toFixed(2)}
                    </ActionButton>
                    <ActionButton
                        onClick={() => {
                            resetClientStore()
                            resetCartStore()
                            signOut().then(() => {
                                resetPersistentId()
                                window.location.href = '/' + search
                            })
                        }}
                        type="button"
                        className="text-xs sm:text-sm"
                    >
                        {t('signout')}
                    </ActionButton>
                </div>
            </div>
            <div className="flex items-center justify-between pt-2">
                <form
                    id="profile_form"
                    onSubmit={handleProfileSubmit}
                    className="flex flex-col sm:flex-row gap-4 w-full"
                    method="post"
                >
                    <div className="flex flex-col w-full">
                        <Table striped className="[&_td]:py-2 [&_td]:px-2 [&_td]:text-xs [&_td]:sm:text-sm">
                            <TableBody>
                                {profileFields.map((field) =>
                                    <TableRow key={field.id}>
                                        <Show
                                            when={modeEditProfile}
                                            fallback={
                                                <>
                                                    <TableCell className="min-w-32 w-48 sm:min-w-48 sm:w-64 text-muted-foreground font-light">
                                                        {t(field.labelText)}:
                                                    </TableCell>
                                                    <TableCell className="text-right sm:text-left">
                                                        {field.type === 'checkbox'
                                                            ? (
                                                                <div className="flex items-center gap-2 justify-end sm:justify-start">
                                                                    <Boolean value={profileState[field.id] === 'true'}/>
                                                                </div>
                                                            )
                                                            : field.id === 'profileCountry'
                                                                ? (
                                                                    <div className="flex items-center gap-2 justify-end sm:justify-start">
                                                                        {(() => {
                                                                            const countryCode = profileState[field.id]
                                                                            const country = findCountryByIso3(countryCode)
                                                                            return country && country.alpha2 ? (
                                                                                <>
                                                                                    <img
                                                                                        src={`https://flagcdn.com/w20/${country.alpha2.toLowerCase()}.png`}
                                                                                        alt={`${country.name} flag`}
                                                                                        className="h-3 w-5 inline-block"
                                                                                    />
                                                                                    <span>{profileState[field.id]}</span>
                                                                                </>
                                                                            ) : profileState[field.id]
                                                                        })()}
                                                                    </div>
                                                                )
                                                                : profileState[field.id]}
                                                    </TableCell>
                                                </>
                                            }
                                        >
                                            <TableCell colSpan={2} className="p-0">
                                                {field.isDropdown ? (
                                                    <DropdownSelect
                                                        selectId={field.id}
                                                        selectTitle={t(field.labelText)}
                                                        data={field.dropdownData || []}
                                                        onSelectAction={(value) => handleDropdownChange(field.id, value)}
                                                        selectedOption={profileState[field.id]}
                                                        showLabel={field.id === 'profileCountry'}
                                                        customClass="px-2"
                                                    />
                                                ) : field.type === 'checkbox' ? (
                                                    <div className="flex items-center justify-between p-2">
                                                        <label htmlFor={field.id} className="text-sm cursor-pointer text-muted-foreground font-light">
                                                            {t(field.labelText)}:
                                                        </label>
                                                        <Checkbox
                                                            id={field.id}
                                                            name={field.name}
                                                            checked={profileState[field.id] === 'true'}
                                                            onCheckedChange={(checked) => handleCheckboxChange(field.id, checked)}
                                                            customClass="px-4"
                                                        />
                                                    </div>
                                                ) : (
                                                    <LineInput
                                                        handleAction={handleProfileChange}
                                                        value={profileState[field.id]}
                                                        labelText={t(field.labelText)}
                                                        labelFor={field.labelFor}
                                                        id={field.id}
                                                        name={field.name}
                                                        type={field.type}
                                                        isRequired={field.isRequired}
                                                        placeholder={t(field.placeholder)}
                                                        size="xs"
                                                    />
                                                )}
                                            </TableCell>
                                        </Show>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex flex-row sm:flex-col justify-center sm:justify-end mt-4 sm:mt-0 sm:min-w-36">
                        <Show
                            when={modeEditProfile}
                            fallback={
                                <div className="flex flex-row sm:flex-col justify-center sm:justify-end transition duration-600 ease">
                                    <ActionButton
                                        type="button"
                                        onClick={handleToggle}
                                        className="flex text-nowrap text-xs mb-2"
                                        icon={PenNibIcon}
                                    >
                                        {t('edit_profile')}
                                    </ActionButton>
                                </div>
                            }>
                            <div className="flex flex-row sm:flex-col justify-center sm:justify-end gap-2 sm:gap-0 transition duration-600 ease">
                                <ActionButton
                                    type="submit"
                                    className="flex text-nowrap text-xs sm:mb-2"
                                    disabled={!ableButtonEditProfile}
                                    icon={CheckCircleIcon}
                                    loading={updateProfile.isPending}
                                >
                                    {t('update_profile')}
                                </ActionButton>
                                <ActionButton
                                    type="button"
                                    onClick={handleToggle}
                                    className="flex text-nowrap text-xs sm:mb-2"
                                    icon={XIcon}
                                >
                                    {t('dont_edit_profile')}
                                </ActionButton>
                            </div>
                        </Show>
                    </div>
                </form>
            </div>
        </div>
    </Show>
}
