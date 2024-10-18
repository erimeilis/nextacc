"use client"

import {usePathname} from "next/navigation"
import {i18n} from "@/i18n-config"
import {useState} from "react"
import Link from "next/link"

export default function LocaleSwitcher(loc) {
    const pathName = usePathname();
    const redirectedPathName = (locale) => {
        if (!pathName) return "/"
        const segments = pathName.split("/")
        segments[1] = locale
        //setActLoc(locale);
        return segments.join("/")
    };
    const [isOpen, setIsOpen] = useState(false)
    const toggle = () => {
        setIsOpen(old => !old)
    }

    return (
        <div className="relative">
            <div className="relative inline-block text-left">
                {/* Dropdown button */}
                <button
                    className="text-white dark:text-gray-100"
                    onClick={toggle}
                >{loc.loc}</button>
                {/* Dropdown menu */}
                {isOpen && (
                    <div className="origin-top-right absolute
                                    right-0 mt-2 rounded-md
                                    shadow-lg bg-white dark:bg-indigo-700 ring-1 ring-black
                                    ring-opacity-5 focus:outline-none">
                        {i18n.locales.map((locale) => (
                            <Link
                                key={locale}
                                href={redirectedPathName(locale)}
                                className="block px-4 py-2 rounded-md
                                               text-sm text-gray-800 dark:text-gray-100
                                               hover:bg-gray-100 dark:hover:bg-indigo-500"
                                onClick={toggle}
                            >
                                {locale}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}