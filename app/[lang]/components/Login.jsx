'use client'
import Button from '@/app/[lang]/components/Button'
import Input from '@/app/[lang]/components/Input'
import Modal from '@/app/[lang]/components/Modal'
import Toggle from '@/app/[lang]/components/Toggle'
import {forgotFields} from '@/app/[lang]/constants/forgotFields'
import {loginFields} from '@/app/[lang]/constants/loginFields'
import {signupFields} from '@/app/[lang]/constants/signupFields'
import {useDictionary} from '@/app/[lang]/DictionaryProvider'
import {schemaForgot} from '@/app/[lang]/schemas/forgot.schema'
import {schemaLogin} from '@/app/[lang]/schemas/login.schema'
import {schemaSignup} from '@/app/[lang]/schemas/signup.schema'
import usePersistState from '@/app/[lang]/usePersistState'
import {validateFormData} from '@/app/[lang]/utils/validation'
import {kcEmail, registerUser} from '@/app/api/auth/[...nextauth]/restRequests'
import {signIn, signOut, useSession} from 'next-auth/react'
import {useState} from 'react'
import {ThreeDots} from 'react-loader-spinner'

let loginFieldsState = {}
loginFields.forEach(field => loginFieldsState[field.id] = '')
let signupFieldsState = {}
signupFields.forEach(field => signupFieldsState[field.id] = '')
let forgotFieldsState = {}
forgotFields.forEach(field => forgotFieldsState[field.id] = '')

export default function Login() {

    const session = useSession()
    const dictionary = useDictionary()

    const [mode, setMode] = usePersistState('')
    const handleToggle = () => {
        setMode(mode === 'checked' ? '' : 'checked')
        setLoginErrors({})
        setSignupErrors({})
        setForgotErrors({})
        setGlobalError(null)
    }

    const [globalError, setGlobalError] = useState(null)
    const [loginState, setLoginState] = useState(loginFieldsState)
    const [loginErrors, setLoginErrors] = useState({})
    const [signupErrors, setSignupErrors] = useState({})
    const [forgotErrors, setForgotErrors] = useState({})
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
                signupState['signupPhone'],
                signupState['signupPassword']
            )
            if (res?.error) {
                setGlobalError(res.error)
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

    if (session && session.status === 'authenticated') {
        return (
            <div className="flex items-center justify-between text-gray-800 dark:text-indigo-200 w-full bg-gray-100 dark:bg-indigo-800 p-10 rounded-md drop-shadow">
                <div>{dictionary['login'].signed_in_as} {session.data.user.email} ({session.data.user.id})</div>
                <Button onClick={() => signOut()}>
                    {dictionary['login'].signout}
                </Button>
            </div>
        )
    } else if (session && session.status === 'loading') {
        return (
            <div className="flex items-center justify-center w-full p-10">
                <ThreeDots
                    visible={true}
                    height="48"
                    width="48"
                    color="#64748b"
                    radius="4"
                    ariaLabel="three-dots-loading"
                />
            </div>
        )
    } else {
        return (
            <div className="text-gray-800 dark:text-indigo-200 w-full bg-gray-100 dark:bg-indigo-800 p-10 rounded-md drop-shadow">
                <div className="flex items-center justify-between">
                    <div>{dictionary['login'].not_signed_in}<br/></div>
                    <Toggle
                        leftLabel={dictionary['login'].signin}
                        rightLabel={dictionary['login'].register}
                        checked={mode}
                        handleToggle={handleToggle}
                    />
                </div>
                <form id="loginForm" name="loginForm" className="mt-8 space-y-6 transition-transform duration-500" style={{display: mode ? 'none' : 'block'}}>
                    <div className="space-y-4">
                        {
                            loginFields.map(field =>
                                <Input
                                    key={field.id}
                                    handleChange={handleLoginChange}
                                    value={loginState[field.id]}
                                    labelText={dictionary['login'][field.labelText]}
                                    labelFor={field.labelFor}
                                    id={field.id}
                                    name={field.name}
                                    type={field.type}
                                    isRequired={field.isRequired}
                                    placeholder={dictionary['login'][field.placeholder]}
                                    icon={field.icon}
                                    error={dictionary['login'][loginErrors[field.id]]}
                                />
                            )
                        }
                    </div>
                    <div className="flex items-center justify-between ">
                        <div className="flex items-center">
                            <input
                                id="rememberMe"
                                name="rememberMe"
                                type="checkbox"
                                className="h-4 w-4 border-gray-300 rounded"
                            />
                            <label htmlFor="rememberMe" className="ml-2 block text-sm">
                                {dictionary['login'].remember_me}
                            </label>
                        </div>
                        <div className="text-sm">
                            <Modal
                                btnTitle={dictionary['login'].forgot_password}
                                btnClassName="font-medium text-blue-800 dark:text-orange-400 hover:text-indigo-600 dark:hover:text-orange-300"
                                customClass="">
                                <form id="forgotForm" name="forgotForm" className="items-center space-y-6 transition-transform duration-500">
                                    {
                                        forgotFields.map(field =>
                                            <Input
                                                key={field.id}
                                                handleChange={handleForgotChange}
                                                value={loginState[field.id]}
                                                labelText={dictionary['login'][field.labelText]}
                                                labelFor={field.labelFor}
                                                id={field.id}
                                                name={field.name}
                                                type={field.type}
                                                isRequired={field.isRequired}
                                                placeholder={dictionary['login'][field.placeholder]}
                                                icon={field.icon}
                                                error={dictionary['login'][forgotErrors[field.id]]}
                                            />
                                        )
                                    }
                                    <Button
                                        type="submit"
                                        className="group flex m-auto"
                                        onClick={handleForgotSubmit}
                                    >
                                        {dictionary['login'].restore}
                                    </Button>
                                </form>
                            </Modal>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <Button
                            type="submit"
                            className="group relative"
                            onClick={handleLoginSubmit}
                        >
                            {dictionary['login'].login}
                        </Button>
                        <div className="flex items-center w-fit transition-transform duration-500
                        font-medium tracking-wide text-white text-xs mt-1 ml-1 px-2 py-0.5
                        bg-red-500 dark:bg-red-600" style={{display: globalError === null ? 'none' : 'block'}}>
                            {dictionary['login'][globalError]}
                        </div>
                        <Button
                            type="button"
                            onClick={() => signIn('google')}
                        >
                            {dictionary['login'].google}
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
                                    labelText={dictionary['login'][field.labelText]}
                                    labelFor={field.labelFor}
                                    id={field.id}
                                    name={field.name}
                                    type={field.type}
                                    isRequired={field.isRequired}
                                    placeholder={dictionary['login'][field.placeholder]}
                                    icon={field.icon}
                                    error={dictionary['login'][signupErrors[field.id]]}
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
                            {dictionary['login'].signup}
                        </Button>
                        <div className="flex items-center w-fit transition-transform duration-500
                        font-medium tracking-wide text-white text-xs mt-1 ml-1 px-2 py-0.5
                        bg-red-500 dark:bg-red-600" style={{display: globalError === null ? 'none' : 'block'}}>
                            {dictionary['login'][globalError]}
                        </div>
                        <Button
                            type="button"
                            onClick={() => signIn('google')}
                        >
                            {dictionary['login'].google}
                        </Button>
                    </div>
                </form>
            </div>
        )
    }
}