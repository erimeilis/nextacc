'use client'
import ActionButton from '@/components/shared/ActionButton'
import CommonInput from '@/components/shared/CommonInput'
import Toggle from '@/components/shared/Toggle'
import {forgotFields} from '@/constants/forgotFields'
import {loginFields} from '@/constants/loginFields'
import {signupFields} from '@/constants/signupFields'
import {verifyFields} from '@/constants/verifyFields'
import {schemaForgot} from '@/schemas/forgot.schema'
import {schemaLogin} from '@/schemas/login.schema'
import {schemaSignup} from '@/schemas/signup.schema'
import {schemaVerify} from '@/schemas/verify.schema'
import usePersistState from '@/utils/usePersistState'
import {validateFormData} from '@/utils/validation'
// Keycloak functions removed during BetterAuth migration
// import {kcSendServiceEmail, registerUser} from '@/app/api/auth/[...nextauth]/requests'
import {Card} from '@/components/ui/Card'
import {Checkbox} from '@/components/ui/Checkbox'
import {Label} from '@/components/ui/Label'
import {Modal} from '@/components/ui/Dialog'
import {signIn} from '@/lib/auth-client'
import {useTranslations} from 'next-intl'
import {ChangeEvent, SyntheticEvent, useState} from 'react'
import {InputField} from '@/types/InputField'
import {useSearchParams} from 'next/navigation'
import {useClientStore} from '@/stores/useClientStore'
import {useRouter} from '@/i18n/routing'

const loginFieldsState: { [index: string]: string } = {}
loginFields.forEach((field: InputField) => loginFieldsState[field.id] = '')
const signupFieldsState: { [index: string]: string } = {}
signupFields.forEach((field: InputField) => signupFieldsState[field.id] = '')
const forgotFieldsState: { [index: string]: string } = {}
forgotFields.forEach((field: InputField) => forgotFieldsState[field.id] = '')
const verifyFieldsState: { [index: string]: string } = {}
verifyFields.forEach((field: InputField) => verifyFieldsState[field.id] = '')

export default function Login() {

    const t = useTranslations('login')
    const setDemoSession = useClientStore(state => state.setDemoSession)
    const router = useRouter()

    const searchParams = useSearchParams()
    const search = searchParams && searchParams.size > 0 ? `?${searchParams.toString()}` : ''
    const query = searchParams && searchParams.size > 0
        ? Object.fromEntries(searchParams.entries())
        : undefined

    const handleDemoLogin = () => {
        setDemoSession(true)
        // Small delay to allow Zustand persist to write to IndexedDB before navigation
        setTimeout(() => {
            router.push(query ? { pathname: '/profile', query } : '/profile')
        }, 100)
    }

    const [modeLogin, setModeLogin] = usePersistState(false, 'loginMode')
    const handleToggle = () => {
        setModeLogin(!modeLogin)
        setLoginErrors({})
        setSignupErrors({})
        setForgotErrors({})
        setGlobalError(null)
    }

    const [globalError, setGlobalError] = useState<string | null>(null)
    const [loginErrors, setLoginErrors] = useState<{ [index: string]: string[] | undefined }>({})
    const [signupErrors, setSignupErrors] = useState<{ [index: string]: string[] | undefined }>({})
    const [forgotErrors, setForgotErrors] = useState<{ [index: string]: string[] | undefined }>({})
    const [verifyErrors, setVerifyErrors] = useState<{ [index: string]: string[] | undefined }>({})
    const [openForgotModal, setOpenForgotModal] = useState(false)
    const [openWarningVerifyModal, setOpenWarningVerifyModal] = useState(false)
    const [warningVerifyModalSent, setWarningVerifyModalSent] = useState(false)

    const [loginState, setLoginState] = useState(loginFieldsState)
    const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLoginState({...loginState, [e.target.id]: e.target.value})
        setGlobalError(null)
    }

    const handleLoginSubmit = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault()
        const {errors} = validateFormData(schemaLogin, loginState)
        setLoginErrors(errors ?? {})
        if (!errors) {
            // Email/password auth is not available in this version
            // Use Google OAuth instead
            setGlobalError('credentials_not_available')
            console.log('Email/password login not available. Please use Google OAuth.')
        }
    }

    const [signupState, setSignupState] = useState(signupFieldsState)
    const handleSignupChange = (e: ChangeEvent<HTMLInputElement>) => setSignupState({...signupState, [e.target.id]: e.target.value})
    const handleSignupSubmit = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault()
        const {errors} = validateFormData(schemaSignup, signupState)
        setSignupErrors(errors ?? {})
        if (!errors) {
            // Email/password signup is not available in this version
            // Use Google OAuth instead
            setGlobalError('signup_not_available')
            console.log('Email/password signup not available. Please use Google OAuth.')
        }
    }

    const [forgotState, setForgotState] = useState(forgotFieldsState)
    const handleForgotChange = (e: ChangeEvent<HTMLInputElement>) => setForgotState({...forgotState, [e.target.id]: e.target.value})
    const handleForgotSubmit = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault()
        const {errors} = validateFormData(schemaForgot, forgotState)
        setForgotErrors(errors ?? {})
        if (!errors) {
            // Password reset is not available in this version
            setGlobalError('feature_not_available')
            console.log('Password reset not available in current version.')
        }
    }

    const [verifyState, setVerifyState] = useState(verifyFieldsState)
    const handleVerifyChange = (e: ChangeEvent<HTMLInputElement>) => setVerifyState({...verifyState, [e.target.id]: e.target.value})
    const handleVerifySubmit = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault()
        const {errors} = validateFormData(schemaVerify, verifyState)
        setVerifyErrors(errors ?? {})
        if (!errors) {
            // Email verification is not available in this version
            setGlobalError('feature_not_available')
            console.log('Email verification not available in current version.')
        }
    }

    return (
        <>
            <Card id="login"
                  className="rounded-none sm:rounded-lg p-6 bg-gradient-to-br from-background to-muted dark:from-background dark:to-muted overflow-hidden">
                <div className="flex items-center justify-between">
                    <div>{t('not_signed_in')}<br/></div>
                    <Toggle
                        leftLabel={t('signin')}
                        rightLabel={t('register')}
                        checked={modeLogin}
                        onToggleAction={handleToggle}
                    />
                </div>
                <form
                    id="loginForm"
                    name="loginForm"
                    className="mt-8 space-y-6 transition-transform duration-500"
                    style={{display: modeLogin ? 'none' : 'block'}}
                    onSubmit={handleLoginSubmit}
                    method="post"
                >
                    <div className="space-y-4">
                        {
                            loginFields.map(field => {
                                    return <CommonInput
                                        key={field.id}
                                        handleChangeAction={handleLoginChange}
                                        value={loginState[field.id]}
                                        labelText={t(field.labelText)}
                                        labelFor={field.labelFor}
                                        id={field.id}
                                        name={field.name}
                                        type={field.type}
                                        isRequired={field.isRequired}
                                        placeholder={t(field.placeholder)}
                                        icon={field.icon}
                                        error={loginErrors[field.id] && loginErrors[field.id]!.length > 0
                                            ? loginErrors[field.id]!.map(err => t(err)).join(', ')
                                            : ''}
                                    />
                                }
                            )
                        }
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="rememberMe"
                                name="rememberMe"
                            />
                            <Label htmlFor="rememberMe" className="text-sm">
                                {t('remember_me')}
                            </Label>
                        </div>
                        <div className="text-sm">
                            <ActionButton
                                type="button"
                                className="font-medium text-blue-800 dark:text-orange-400 hover:text-indigo-600 dark:hover:text-orange-300"
                                onClick={() => setOpenForgotModal(true)}>{t('forgot_password')}
                            </ActionButton>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <ActionButton
                            type="submit"
                            className="group relative"
                            //onClick={HandleLoginSubmit}
                        >
                            {t('login')}
                        </ActionButton>
                        <div className="flex items-center w-fit transition-transform duration-500
                        font-medium tracking-wide text-white text-xs mt-1 ml-1 px-2 py-0.5
                        bg-red-500 dark:bg-red-600" style={{display: globalError === null ? 'none' : 'block'}}>
                            {globalError ? t(globalError) : ''}
                        </div>
                        <ActionButton
                            type="button"
                            className="opacity-50"
                            onClick={handleDemoLogin}
                        >
                            {t('demo')}
                        </ActionButton>
                        <ActionButton
                            type="button"
                            onClick={() => signIn.social({
                                provider: 'google',
                                callbackURL: '/profile/' + search
                            })}
                        >
                            {t('google')}
                        </ActionButton>
                    </div>
                </form>
                <form
                    id="signupForm"
                    name="signupForm"
                    className="mt-8 space-y-6 transition-transform duration-500"
                    style={{display: modeLogin ? 'block' : 'none'}}
                    onSubmit={handleSignupSubmit}
                    method="post"
                >
                    <div className="space-y-4">
                        {
                            signupFields.map(field =>
                                <CommonInput
                                    key={field.id}
                                    handleChangeAction={handleSignupChange}
                                    value={signupState[field.id]}
                                    labelText={t(field.labelText)}
                                    labelFor={field.labelFor}
                                    id={field.id}
                                    name={field.name}
                                    type={field.type}
                                    isRequired={field.isRequired}
                                    placeholder={t(field.placeholder)}
                                    icon={field.icon}
                                    error={t.has(`${signupErrors[field.id]}`) ? t(`${signupErrors[field.id]}`) : ''}
                                />
                            )
                        }
                    </div>
                    <div className="flex items-center justify-between">
                        <ActionButton
                            type="submit"
                            className="group relative"
                            //onClick={handleSignupSubmit}
                        >
                            {t('signup')}
                        </ActionButton>
                        <div className="flex items-center w-fit transition-transform duration-500
                        font-medium tracking-wide text-white text-xs mt-1 ml-1 px-2 py-0.5
                        bg-red-500 dark:bg-red-600" style={{display: globalError === null ? 'none' : 'block'}}>
                            {globalError ? t(globalError) : ''}
                        </div>
                        <ActionButton
                            type="button"
                            className="opacity-50"
                            onClick={handleDemoLogin}
                        >
                            {t('demo')}
                        </ActionButton>
                        <ActionButton
                            type="button"
                            onClick={() => signIn.social({
                                provider: 'google',
                                callbackURL: '/profile/' + search
                            })}
                        >
                            {t('google')}
                        </ActionButton>
                    </div>
                </form>
            </Card>

            <Modal dismissible show={openForgotModal} onClose={() => {
                setForgotErrors({})
                setOpenForgotModal(false)
            }}>
                <Modal.Body>
                    <form
                        id="forgotForm"
                        name="forgotForm"
                        className="items-center space-y-6 transition-transform duration-500"
                        onSubmit={handleForgotSubmit}
                        method="post"
                    >
                        {
                            forgotFields.map(field =>
                                <CommonInput
                                    key={field.id}
                                    handleChangeAction={handleForgotChange}
                                    value={forgotState[field.id]}
                                    labelText={t(field.labelText)}
                                    labelFor={field.labelFor}
                                    id={field.id}
                                    name={field.name}
                                    type={field.type}
                                    isRequired={field.isRequired}
                                    placeholder={t(field.placeholder)}
                                    icon={field.icon}
                                    error={t.has(`${forgotErrors[field.id]}`) ? t(`${forgotErrors[field.id]}`) : ''}
                                />
                            )
                        }
                        <ActionButton
                            type="submit"
                            className="group flex m-auto"
                            //onClick={handleForgotSubmit}
                        >
                            {t('restore')}
                        </ActionButton>
                    </form>
                </Modal.Body>
            </Modal>

            <Modal dismissible show={openWarningVerifyModal} onClose={() => {
                setVerifyErrors({})
                setOpenWarningVerifyModal(false)
                setWarningVerifyModalSent(false)
            }}>
                {!warningVerifyModalSent ?
                    <Modal.Body>
                        <div className="content-center">{t('email_unverified')}</div>
                        <form
                            id="verifyForm"
                            name="verifyForm"
                            className="items-center space-y-6 transition-transform duration-500"
                            onSubmit={handleVerifySubmit}
                            method="post"
                        >
                            {
                                verifyFields.map(field =>
                                    <CommonInput
                                        key={field.id}
                                        handleChangeAction={handleVerifyChange}
                                        value={verifyState[field.id]}
                                        labelText={t(field.labelText)}
                                        labelFor={field.labelFor}
                                        id={field.id}
                                        name={field.name}
                                        type={field.type}
                                        isRequired={field.isRequired}
                                        placeholder={t(field.placeholder)}
                                        icon={field.icon}
                                        error={t.has(`${verifyErrors[field.id]}`) ? t(`${verifyErrors[field.id]}`) : ''}
                                    />
                                )
                            }
                            <ActionButton
                                type="submit"
                                className="group flex m-auto"
                                //onClick={handleVerifySubmit}
                            >
                                {t('resend_verify')}
                            </ActionButton>
                        </form>
                    </Modal.Body> :
                    <Modal.Body>
                        <div className="content-center">{t('email_verify_sent')}</div>
                    </Modal.Body>}
            </Modal>
        </>
    )
}
