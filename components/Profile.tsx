'use client'
import Button from '@/components/shared/Button'
import {redSetUserProfile} from '@/app/api/redreport/profile'
import {signOut} from 'next-auth/react'
import {useTranslations} from 'next-intl'
import {UserProfile} from '@/types/UserProfile'
import LineInput from '@/components/shared/LineInput'
import {CheckCircle, Pencil, X} from '@phosphor-icons/react'
import Loader from '@/components/service/Loader'
import React, {ChangeEvent, SyntheticEvent, useState} from 'react'
import {InputField} from '@/types/InputField'
import {profileFields} from '@/constants/profileFields'
import Show from '@/components/service/Show'
import {useSearchParams} from 'next/navigation'

const profileFieldsState: { [index: string]: string } = {}
profileFields.forEach((field: InputField) => profileFieldsState[field.id] = '')

export default function Profile({
                                    profile
                                }: {
    profile: UserProfile | null
}): React.ReactElement {
    const t = useTranslations('profile')

    const searchParams = useSearchParams()
    const search = searchParams.size > 0 ? `?${searchParams.toString()}` : ''

    const [modeEditProfile, setModeEditProfile] = useState(false)
    const handleToggle = () => {
        setModeEditProfile(!modeEditProfile)
        setAbleButtonEditProfile(false)
    }
    const [modeButtonEditProfile, setModeButtonEditProfile] = useState(false)
    const [ableButtonEditProfile, setAbleButtonEditProfile] = useState(false)

    const [profileState, setProfileState] = useState(profileFieldsState)
    const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
        setProfileState({...profileState, [e.target.id]: e.target.value})
        setAbleButtonEditProfile(true)
    }

    const handleProfileSubmit = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault()
        setModeButtonEditProfile(true)
        //const {errors} = validateFormData(schemaLogin, profileState)
        //setProfileErrors(errors ?? {})
        //if (!errors) {
        //const rem = document.getElementById('rememberMe') as HTMLInputElement
        const data = await redSetUserProfile(
            {
                phone: Number(profileState['profilePhone']),
                firstname: profileState['profileFirstname'],
                lastname: profileState['profileLastname'],
                company: profileState['profileCompany'],
                country: profileState['profileCountry'],
                address: profileState['profileAddress'],
            })
        /*if (data && data.error) {
            setGlobalError(data.error)
            if (data.error === 'email_unverified') {
                setVerifyState({
                    'verifyEmail': loginState['loginEmail'],
                })
                setOpenWarningVerifyModal(true)
            }
        }*/
        //}
        if (data) {
            setModeEditProfile(!modeEditProfile)
            setModeButtonEditProfile(false)
        }
    }

    function Userinfo() {
        const data = profile
        if (data) {
            profileFields.forEach((field: InputField) => {
                const shortId = field.id.split('profile')[1].toLowerCase()
                if (profileState[field.id] === '' && data[shortId as keyof UserProfile]) {
                    setProfileState({
                        ...profileState,
                        [field.id]: data[shortId as keyof UserProfile].toString()
                    })
                }
            })
        }
        return data ?? null
    }

    const userProfile = Userinfo()

    return <Show
        when={typeof userProfile !== 'undefined' && userProfile !== null}
        fallback={<Loader height={350}/>}>
        <div id="profile" className="transition duration-300 ease">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-indigo-900 drop-shadow-sm">
                <div className="text-sm px-2 pt-2">{t('signed_in_as')} {userProfile?.email} ({userProfile?.id})</div>
                <Button
                    onClick={() => {
                    }}
                    type="button"
                    className="text-sm"
                >
                    {t('balance')}: {userProfile?.balance.toFixed(2) + ' ' + userProfile?.currency}
                </Button>
                <Button
                    onClick={() => signOut({redirectTo: '/' + search})}
                    type="button"
                    className="text-sm"
                >
                    {t('signout')}
                </Button>
            </div>
            <div className="flex items-center justify-between pt-2">
                <form
                    id="profile_form"
                    onSubmit={handleProfileSubmit}
                    className="flex flex-row gap-4 w-full"
                    method="post"
                >
                    <div className="flex flex-col w-full">
                        {profileFields.map((field, i) =>
                            <div
                                key={field.id}
                                className={(i % 2 != 0 ? 'bg-gray-200 dark:bg-indigo-900 bg-opacity-50 dark:bg-opacity-40' : '')}
                            >
                                <Show
                                    when={modeEditProfile}
                                    fallback={
                                        <div className="flex flex-row">
                                            <p className="p-2 text-sm">{t(field.labelText)}:&nbsp;&nbsp;{profileState[field.id]}</p>
                                        </div>}
                                >
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
                                        size="sm"
                                        customClass="rounded-none border-b-none"
                                    />
                                </Show>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col grow justify-end min-w-36">
                        <Show
                            when={modeEditProfile}
                            fallback={
                                <div className="flex flex-col grow justify-end transition duration-600 ease">
                                    <Button
                                        type="button"
                                        onClick={handleToggle}
                                        className="flex text-nowrap text-xs mb-2"
                                        icon={Pencil}
                                    >
                                        {t('edit_profile')}
                                    </Button>
                                </div>
                            }>
                            <div className="flex flex-col grow justify-end transition duration-600 ease">
                                <Button
                                    type="submit"
                                    className="flex text-nowrap text-xs mb-2"
                                    disabled={!ableButtonEditProfile}
                                    icon={CheckCircle}
                                    loading={modeButtonEditProfile}
                                >
                                    {t('update_profile')}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleToggle}
                                    className="flex text-nowrap text-xs mb-2"
                                    icon={X}
                                >
                                    {t('dont_edit_profile')}
                                </Button>
                            </div>
                        </Show>
                    </div>
                </form>
            </div>
        </div>
    </Show>
}