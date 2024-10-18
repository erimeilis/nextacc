"use client"
import {useSession, signIn, signOut} from "next-auth/react"
import {useState} from "react";
import Input from "@/app/[lang]/components/Input";
import {loginFields} from "@/app/[lang]/constants/loginFormFields";
import {useDictionary} from "@/app/[lang]/DictionaryProvider";

export default function Component() {
    const session = useSession()
    const dictionary = useDictionary()

    const fields = loginFields;
    let fieldsState = {};
    fields.forEach(field => fieldsState[field.id] = '');

    const [loginState, setLoginState] = useState(fieldsState);
    const handleChange = (e) => {
        setLoginState({...loginState, [e.target.id]: e.target.value})
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        signIn('kccreds', {
            username: loginState['email'],
            password: loginState['password'],
            rememberMe: document.getElementById('rememberMe').checked
        }).then();
    }

    if (session && session.status === "authenticated") {
        return (
            <div className="flex items-center justify-between text-gray-800 dark:text-indigo-200 w-full bg-gray-100 dark:bg-indigo-800 p-10 rounded-md">
                <div>{dictionary['login'].signed_in_as} {session.data.user.email} ({session.data.user.id})</div>
                <button onClick={() => signOut()}>{dictionary['login'].signout}</button>
            </div>
        )
    }
    return (
            <div className="text-gray-800 dark:text-indigo-200 w-full bg-gray-100 dark:bg-indigo-800 p-10 rounded-md">
                {dictionary['login'].not_signed_in}<br/>
                <form className="mt-8 space-y-6">
                    <div className="-space-y-px">
                        {
                            fields.map(field =>
                                <Input
                                    key={field.id}
                                    handleChange={handleChange}
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
                            <a href="#" className="font-medium text-purple-600 dark:text-orange-400 hover:text-purple-500 dark:hover:text-orange-300">
                                {dictionary['login'].forgot_password}
                            </a>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            //type="submit"
                            className="group relative"
                            onClick={handleSubmit}
                        >
                            {dictionary['login'].login}
                        </button>
                        <button onClick={() => signIn("google")}>{dictionary['login'].google}</button>
                    </div>
                </form>
            </div>
        )
}