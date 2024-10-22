"use client"
import {FaRegMoon, FaRegSun, FaCircleNotch} from "react-icons/fa"
import {useState, useEffect} from 'react'
import {useTheme} from 'next-themes'

export default function StyleSwitcher() {
    const [mounted, setMounted] = useState(false)
    const {setTheme, resolvedTheme} = useTheme()

    useEffect(() => setMounted(true), [])

    if (!mounted) return (
        <FaCircleNotch className="text-slate-600" size={20} />
    )

    if (resolvedTheme === 'dark') {
        return <FaRegSun className="hidden dark:block text-indigo-400" size={20} onClick={() => setTheme('light')}/>
    }

    if (resolvedTheme === 'light') {
        return <FaRegMoon className="dark:hidden text-amber-200" size={20} onClick={() => setTheme('dark')}/>
    }
}