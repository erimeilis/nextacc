'use client'
import Button from '@/app/[locale]/components/Button'
import Input from '@/app/[locale]/components/Input'
import Toggle from '@/app/[locale]/components/Toggle'
import {forgotFields} from '@/app/[locale]/constants/forgotFields'
import {loginFields} from '@/app/[locale]/constants/loginFields'
import {signupFields} from '@/app/[locale]/constants/signupFields'
import {verifyFields} from '@/app/[locale]/constants/verifyFields'
import {schemaForgot} from '@/app/[locale]/schemas/forgot.schema'
import {schemaLogin} from '@/app/[locale]/schemas/login.schema'
import {schemaSignup} from '@/app/[locale]/schemas/signup.schema'
import {schemaVerify} from '@/app/[locale]/schemas/verify.schema'
import usePersistState from '@/app/[locale]/usePersistState'
import {validateFormData} from '@/app/[locale]/utils/validation'
import {kcEmail, registerUser} from '@/app/api/auth/[...nextauth]/restRequests'
import {Card, Checkbox, Label, Modal} from 'flowbite-react'
import {signIn} from 'next-auth/react'
import {useTranslations} from 'next-intl'
import {useState} from 'react'

let loginFieldsState = {}
loginFields.forEach(field => loginFieldsState[field.id] = '')
let signupFieldsState = {}
signupFields.forEach(field => signupFieldsState[field.id] = '')
let forgotFieldsState = {}
forgotFields.forEach(field => forgotFieldsState[field.id] = '')
let verifyFieldsState = {}
verifyFields.forEach(field => verifyFieldsState[field.id] = '')

export default function Login() {

    const t = useTranslations('login')
    const c = useTranslations('common')

    const [mode, setMode] = usePersistState('')
    const handleToggle = () => {
        setMode(mode === 'checked' ? '' : 'checked')
        setLoginErrors({})
        setSignupErrors({})
        setForgotErrors({})
        setGlobalError(null)
    }

    const [globalError, setGlobalError] = useState(null)
    const [loginErrors, setLoginErrors] = useState({})
    const [signupErrors, setSignupErrors] = useState({})
    const [forgotErrors, setForgotErrors] = useState({})
    const [verifyErrors, setVerifyErrors] = useState({})
    const [openForgotModal, setOpenForgotModal] = useState(false)
    const [openWarningVerifyModal, setOpenWarningVerifyModal] = useState(false)
    const [warningVerifyModalSent, setWarningVerifyModalSent] = useState(false)

    const [loginState, setLoginState] = useState(loginFieldsState)
    const handleLoginChange = (e) => {
        setLoginState({...loginState, [e.target.id]: e.target.value})
        setGlobalError(null)
    }
    const handleLoginSubmit = async (e) => {
        e.preventDefault()
        const {errors} = validateFormData(schemaLogin, loginState)
        if (errors) {
            setLoginErrors(errors)
        } else {
            setLoginErrors({})
            const res = await signIn('kccreds', {
                username: loginState['loginEmail'],
                password: loginState['loginPassword'],
                rememberMe: document.getElementById('rememberMe').checked,
                redirect: false
            })
            if (res?.error) {
                setGlobalError(res.error)
                if (res.error === 'email_unverified') {
                    setVerifyState({
                        'verifyEmail': loginState['loginEmail'],
                    })
                    setOpenWarningVerifyModal(true)
                }
            }
        }
    }

    const [signupState, setSignupState] = useState(signupFieldsState)
    const handleSignupChange = (e) => setSignupState({...signupState, [e.target.id]: e.target.value})
    const handleSignupSubmit = async (e) => {
        e.preventDefault()
        const {errors} = validateFormData(schemaSignup, signupState)
        if (errors) {
            setSignupErrors(errors)
        } else {
            setSignupErrors({})
            const res = await registerUser(
                signupState['signupEmail'],
                signupState['signupPassword'],
                signupState['signupPhone'],
                c('locale')
            )
            if (res?.error) {
                setGlobalError(res.error)
                if (res.error === 'email_verify_sent') {
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
    const handleForgotChange = (e) => setForgotState({...forgotState, [e.target.id]: e.target.value})
    const handleForgotSubmit = async (e) => {
        e.preventDefault()
        const {errors} = validateFormData(schemaForgot, forgotState)
        if (errors) {
            setForgotErrors(errors)
        } else {
            setForgotErrors({})
            const res = await kcEmail({
                email: forgotState['forgotEmail'],
                reason: 'UPDATE_PASSWORD'
            })
            if (res?.error) {
                setGlobalError(res.error)
            }
        }
    }

    const [verifyState, setVerifyState] = useState(verifyFieldsState)
    const handleVerifyChange = (e) => setVerifyState({...verifyState, [e.target.id]: e.target.value})
    const handleVerifySubmit = async (e) => {
        e.preventDefault()
        const {errors} = validateFormData(schemaVerify, verifyState)
        if (errors) {
            setVerifyErrors(errors)
        } else {
            setVerifyErrors({})
            const res = await kcEmail({
                email: verifyState['verifyEmail'],
                reason: 'VERIFY_EMAIL'
            })
            if (res?.error) {
                setGlobalError(res.error)
            } else {
                setWarningVerifyModalSent(true)
            }
        }
    }


    return (
        <>
            <Card id="login">
                <div className="flex items-center justify-between">
                    <div>{t('not_signed_in')}<br/></div>
                    <Toggle
                        leftLabel={t('signin')}
                        rightLabel={t('register')}
                        checked={mode}
                        handleToggle={handleToggle}
                    />
                </div>
                <form
                    id="loginForm"
                    name="loginForm"
                    className="mt-8 space-y-6 transition-transform duration-500"
                    style={{display: mode ? 'none' : 'block'}}
                >
                    <div className="space-y-4">
                        {
                            loginFields.map(field =>
                                <Input
                                    key={field.id}
                                    handleChange={handleLoginChange}
                                    value={loginState[field.id]}
                                    labelText={t(field.labelText)}
                                    labelFor={field.labelFor}
                                    id={field.id}
                                    name={field.name}
                                    type={field.type}
                                    isRequired={field.isRequired}
                                    placeholder={t(field.placeholder)}
                                    icon={field.icon}
                                    error={t.has(`${loginErrors[field.id]}`) ? t(`${loginErrors[field.id]}`) : ''}
                                />
                            )
                        }
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Checkbox
                                id="rememberMe"
                                name="rememberMe"
                                type="checkbox"
                                className="h-4 w-4 border-gray-300 rounded"
                            />
                            <Label htmlFor="rememberMe" className="ml-2 block text-sm">
                                {t('remember_me')}
                            </Label>
                        </div>
                        <div className="text-sm">
                            <Button
                                className="font-medium text-blue-800 dark:text-orange-400 hover:text-indigo-600 dark:hover:text-orange-300"
                                onClick={() => setOpenForgotModal(true)}>{t('forgot_password')}
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <Button
                            type="submit"
                            className="group relative"
                            onClick={handleLoginSubmit}
                        >
                            {t('login')}
                        </Button>
                        <div className="flex items-center w-fit transition-transform duration-500
                        font-medium tracking-wide text-white text-xs mt-1 ml-1 px-2 py-0.5
                        bg-red-500 dark:bg-red-600" style={{display: globalError === null ? 'none' : 'block'}}>
                            {t(globalError)}
                        </div>
                        <Button
                            type="button"
                            onClick={() => signIn('google')}
                        >
                            {t('google')}
                        </Button>
                    </div>
                </form>
                <form id="signupForm" name="signupForm" className="mt-8 space-y-6 transition-transform duration-500" style={{display: mode ? 'block' : 'none'}}>
                    <div className="space-y-4">
                        {
                            signupFields.map(field =>
                                <Input
                                    key={field.id}
                                    handleChange={handleSignupChange}
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
                        <Button
                            type="submit"
                            className="group relative"
                            onClick={handleSignupSubmit}
                        >
                            {t('signup')}
                        </Button>
                        <div className="flex items-center w-fit transition-transform duration-500
                        font-medium tracking-wide text-white text-xs mt-1 ml-1 px-2 py-0.5
                        bg-red-500 dark:bg-red-600" style={{display: globalError === null ? 'none' : 'block'}}>
                            {t(globalError)}
                        </div>
                        <Button
                            type="button"
                            onClick={() => signIn('google')}
                        >
                            {t('google')}
                        </Button>
                    </div>
                </form>
            </Card>

            <Modal dismissible show={openForgotModal} onClose={() => {
                setForgotErrors({})
                setOpenForgotModal(false)
            }}>
                <Modal.Body>
                    <form id="forgotForm" name="forgotForm" className="items-center space-y-6 transition-transform duration-500">
                        {
                            forgotFields.map(field =>
                                <Input
                                    key={field.id}
                                    handleChange={handleForgotChange}
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

                        <Button
                            type="submit"
                            className="group flex m-auto"
                            onClick={handleForgotSubmit}
                        >
                            {t('restore')}
                        </Button>
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
                        <form id="verifyForm" name="verifyForm" className="items-center space-y-6 transition-transform duration-500">
                            {
                                verifyFields.map(field =>
                                    <Input
                                        key={field.id}
                                        handleChange={handleVerifyChange}
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

                            <Button
                                type="submit"
                                className="group flex m-auto"
                                onClick={handleVerifySubmit}
                            >
                                {t('resend_verify')}
                            </Button>
                        </form>
                    </Modal.Body> :
                    <Modal.Body>
                        <div className="content-center">{t('verify_sent')}</div>
                    </Modal.Body>}
            </Modal>
        </>
    )
}