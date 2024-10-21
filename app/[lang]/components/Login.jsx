"use client"
import {useSession, signIn, signOut} from "next-auth/react"
import {useState} from "react"
import Input from "@/app/[lang]/components/Input"
import {loginFields} from "@/app/[lang]/constants/loginFormFields"
import {signupFields} from "@/app/[lang]/constants/loginFormFields"
import {useDictionary} from "@/app/[lang]/DictionaryProvider"
import Toggle from "@/app/[lang]/components/Toggle"
import {ThreeDots} from "react-loader-spinner";
import usePersistState from "@/app/[lang]/usePersistState";
import {kcEmail, registerUser} from "@/app/api/auth/[...nextauth]/restRequests";
import Modal from "@/app/[lang]/components/Modal";

let loginFieldsState = {};
loginFields.forEach(field => loginFieldsState[field.id] = '')
let signupFieldsState = {}
signupFields.forEach(field => signupFieldsState[field.id] = '')

export default function Login() {
    const session = useSession()
    const dictionary = useDictionary()

    const [mode, setMode] = usePersistState('');
    const handleToggle = () => {
        setMode(mode === 'checked' ? '' : 'checked')
    }

    const [loginState, setLoginState] = useState(loginFieldsState)
    const handleLoginChange = (e) => setLoginState({...loginState, [e.target.id]: e.target.value})
    const handleLoginSubmit = (e) => {
        e.preventDefault();
        signIn('kccreds', {
            username: loginState['email'],
            password: loginState['password'],
            rememberMe: document.getElementById('rememberMe').checked
        }).then()
    }

    const [signupState, setSignupState] = useState(signupFieldsState)
    const handleSignupChange = (e) => setSignupState({...signupState, [e.target.id]: e.target.value})
    const handleSignupSubmit = (e) => {
        e.preventDefault();
        registerUser(
            signupState['email'],
            signupState['phone'],
            signupState['password']
        ).then()
    }

    const handleForgotSubmit = (e) => {
        e.preventDefault();
        kcEmail({
            email: document.getElementById('forgot-email').value,
            reason: 'UPDATE_PASSWORD'
        }).then()
    }

    if (session && session.status === "authenticated") {
        return (
            <div className="flex items-center justify-between text-gray-800 dark:text-indigo-200 w-full bg-gray-100 dark:bg-indigo-800 p-10 rounded-md">
                <div>{dictionary['login'].signed_in_as} {session.data.user.email} ({session.data.user.id})</div>
                <button onClick={() => signOut()}>{dictionary['login'].signout}</button>
            </div>
        )
    } else if (session && session.status === "loading") {
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
            <div className="text-gray-800 dark:text-indigo-200 w-full bg-gray-100 dark:bg-indigo-800 p-10 rounded-md">
                <div className="flex items-center justify-between">
                    <div>{dictionary['login'].not_signed_in}<br/></div>
                    <Toggle
                        leftLabel={dictionary['login'].signin}
                        rightLabel={dictionary['login'].register}
                        checked={mode}
                        handleToggle={handleToggle}
                    />
                </div>
                <form id="loginForm" className="mt-8 space-y-6 transition-transform duration-500" style={{display: mode ? "none" : "block"}}>
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
                                btnClassName="font-medium text-purple-600 dark:text-orange-400 hover:text-purple-500 dark:hover:text-orange-300"
                                customClass="">
                                <form id="forgotForm" className="items-center space-y-6 transition-transform duration-500">
                                    <Input
                                        key="forgot-email"
                                        //handleChange={handleLoginChange}
                                        //value={loginState[field.id]}
                                        labelText={dictionary['login'].email}
                                        labelFor="forgot-email"
                                        id="forgot-email"
                                        name="forgot-email"
                                        type="email"
                                        isRequired="true"
                                        placeholder={dictionary['login'].email}
                                        customClass="w-full flex"
                                    />
                                    <button
                                        //type="submit"
                                        className="group flex m-auto"
                                        onClick={handleForgotSubmit}
                                    >
                                        {dictionary['login'].restore}
                                    </button>
                                    </form>
                            </Modal>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            //type="submit"
                            className="group relative"
                            onClick={handleLoginSubmit}
                        >
                            {dictionary['login'].login}
                        </button>
                        <button type="button" onClick={() => signIn("google")}>{dictionary['login'].google}</button>
                    </div>
                </form>
                <form id="signupForm" className="mt-8 space-y-6 transition-transform duration-500" style={{display: mode ? "block" : "none"}}>
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
                                />
                            )
                        }
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            //type="submit"
                            className="group relative"
                            onClick={handleSignupSubmit}
                        >
                            {dictionary['login'].signup}
                        </button>
                        <button type="button" onClick={() => signIn("google")}>{dictionary['login'].google}</button>
                    </div>
                </form>
            </div>
        )
    }
}