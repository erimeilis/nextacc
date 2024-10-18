// components/Navbar.jsx
"use client"
import React from 'react'
import { MdDarkMode, MdLightMode } from 'react-icons/md'
import { useEffect } from 'react'

import LocaleSwitcher from "./LocaleSwitcher"

export default function Navbar(loc) {
    const menu = [
        {name: 'Home', url: '#home'},
        {name: 'Services', url: '#services'},
        {name: 'Map', url: '#map'},
        {name: 'Tarif', url: '#price'},
        {name: 'Contact', url: '#contact'},
    ];

    useEffect(() => {
        const theme = localStorage.getItem('theme')
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        }
    }, []);

    const toggleTheme = () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        } else {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        }
    }

    return (
        <nav className="block w-full px-4 py-2 mx-auto bg-orange-500 dark:bg-indigo-950 bg-opacity-90 sticky top-3 shadow lg:px-8 lg:py-3 backdrop-blur-lg backdrop-saturate-150 z-[9999]">
            <div className="container flex flex-wrap items-center justify-between mx-auto text-slate-800">
                <a href="#"
                   className="mr-4 block cursor-pointer py-1.5 text-base text-white font-semibold">
                    Material Tailwind
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
                        <li><LocaleSwitcher loc={loc.loc} /></li>
                        <li><button onClick={toggleTheme}>
                            <MdLightMode className="hidden dark:block text-indigo-400" size={20} /><MdDarkMode className="dark:hidden text-amber-200" size={20} />
                        </button></li>
                    </ul>
                </div>
                <button
                    className="relative ml-auto h-6 max-h-[40px] w-6 max-w-[40px] select-none rounded-lg text-center align-middle text-xs font-medium uppercase text-inherit transition-all hover:bg-transparent focus:bg-transparent active:bg-transparent disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none lg:hidden"
                    type="button">
      <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </span>
                </button>
            </div>
        </nav>
    )
}