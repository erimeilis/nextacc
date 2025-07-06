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
import {kcSendServiceEmail, registerUser} from '@/app/api/auth/[...nextauth]/requests'
import {Card} from '@/components/ui/Card'
import {Checkbox} from '@/components/ui/Checkbox'
import {Label} from '@/components/ui/Label'
import {Modal} from '@/components/ui/Dialog'
import {signIn} from 'next-auth/react'
import {useTranslations} from 'next-intl'
import {ChangeEvent, SyntheticEvent, useState} from 'react'
import {InputField} from '@/types/InputField'
import {useSearchParams} from 'next/navigation'
import {useClientStore} from '@/stores/useClientStore'

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
    const c = useTranslations('common')
    const {fetchData} = useClientStore()

    const searchParams = useSearchParams()
    const search = searchParams && searchParams.size > 0 ? `?${searchParams.toString()}` : ''

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
            const rem = document.getElementById('rememberMe') as HTMLInputElement
            const data = await signIn('kccreds', {
                username: loginState['loginEmail'],
                password: loginState['loginPassword'],
                rememberMe: rem.checked,
                redirect: false,
                redirectTo: '/profile/' + search
            })
            if (data && data.error) {
                setGlobalError(data.error)
                if (data.error === 'email_unverified') {
                    setVerifyState({
                        'verifyEmail': loginState['loginEmail'],
                    })
                    setOpenWarningVerifyModal(true)
                }
            } else if (data && !data.error) {
                // Fetch user data in the background after successful login
                fetchData().then()
            }
        }
    }

    const [signupState, setSignupState] = useState(signupFieldsState)
    const handleSignupChange = (e: ChangeEvent<HTMLInputElement>) => setSignupState({...signupState, [e.target.id]: e.target.value})
    const handleSignupSubmit = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault()
        const {errors} = validateFormData(schemaSignup, signupState)
        setSignupErrors(errors ?? {})
        if (!errors) {
            const data = await registerUser({
                username: signupState['signupEmail'],
                password: signupState['signupPassword'],
                phone: signupState['signupPhone'],
                locale: c('locale')
            })
            if (data && data.error) {
                setGlobalError(data.error)
                if (data.error === 'email_verify_sent') {
                    setVerifyState({
                        'verifyEmail': loginState['loginEmail'],
                    })
                    setWarningVerifyModalSent(true)
                    setOpenWarningVerifyModal(true)
                }
            }
        }
    }

    const [forgotState, setForgotState] = useState(forgotFieldsState)
    const handleForgotChange = (e: ChangeEvent<HTMLInputElement>) => setForgotState({...forgotState, [e.target.id]: e.target.value})
    const handleForgotSubmit = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault()
        const {errors} = validateFormData(schemaForgot, forgotState)
        setForgotErrors(errors ?? {})
        if (!errors) {
            const data = await kcSendServiceEmail({
                email: forgotState['forgotEmail'],
                reason: 'UPDATE_PASSWORD'
            })
            if (data) {
                setGlobalError('email_restore_sent')
            }
        }
    }

    const [verifyState, setVerifyState] = useState(verifyFieldsState)
    const handleVerifyChange = (e: ChangeEvent<HTMLInputElement>) => setVerifyState({...verifyState, [e.target.id]: e.target.value})
    const handleVerifySubmit = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault()
        const {errors} = validateFormData(schemaVerify, verifyState)
        setVerifyErrors(errors ?? {})
        if (!errors) {
            const data = await kcSendServiceEmail({
                email: verifyState['verifyEmail'],
                reason: 'VERIFY_EMAIL'
            })
            if (data) {
                setGlobalError('email_verify_sent')
            } else {
                setWarningVerifyModalSent(true)
            }
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
                        onToggle={handleToggle}
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
                            onClick={() => signIn('google', {
                                redirectTo: '/profile/' + search
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
                            onClick={() => signIn('google', {
                                redirectTo: '/profile/' + search
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
