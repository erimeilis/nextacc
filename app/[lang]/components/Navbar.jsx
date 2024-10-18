"use client"
import React from 'react'
import LocaleSwitcher from "./LocaleSwitcher"
import StyleSwitcher from "@/app/[lang]/components/StyleSwitcher"
import Image from 'next/image'
import logo from '@/app/[lang]/icon.png'
import logoLight from '@/app/[lang]/icon-light.png'

export default function Navbar(loc) {
    const menu = [
        {name: 'Home', url: '#home'},
        {name: 'Services', url: '#services'},
        {name: 'Map', url: '#map'},
        {name: 'Tarif', url: '#price'},
        {name: 'Contact', url: '#contact'},
    ]

    return (
        <nav
            className="block w-full px-4 py-2 mx-auto bg-orange-500 dark:bg-indigo-950 bg-opacity-90 sticky top-0 shadow lg:px-8 lg:py-3 backdrop-blur-lg backdrop-saturate-150 z-[9999]">
            <div className="container flex flex-wrap items-center justify-between mx-auto text-slate-800">
                <a href="#"
                   className="mr-4 block cursor-pointer text-base text-white font-semibold">
                    <Image
                        src={logo}
                        width={48}
                        height={48}
                        alt="logo"
                        className="hidden dark:block"
                    />
                    <Image
                        src={logoLight}
                        width={48}
                        height={48}
                        alt="logo"
                        className="dark:hidden"
                    />
                </a>
                <div className="hidden lg:block">
                    <ul className="flex flex-col gap-2 mt-2 mb-4 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
                        {menu.map((x, index) => (
                            <li className="flex items-center p-1 text-sm gap-x-2 text-amber-100 dark:text-indigo-300" key={index}>
                                <a
                                    href={x.url}
                                    className="flex items-center"
                                >
                                    {x.name}

                                </a>
                            </li>
                        ))}
                        <li><LocaleSwitcher loc={loc.loc}/></li>
                        <li><StyleSwitcher/></li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}