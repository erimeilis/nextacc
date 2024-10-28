'use client'
import logo from '@/app/[locale]/icon.png'
import {DotsThreeVertical, Moon, Sun} from '@phosphor-icons/react'
import {Avatar, DarkThemeToggle, Dropdown, Navbar} from 'flowbite-react'
import Image from 'next/image'
import React from 'react'
import logoLight from '../icon-light.png'
import LocaleSwitcher from './LocaleSwitcher'

export default function Nav() {
    return (
        <Navbar
            fluid
        >
            <Navbar.Brand>
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
            </Navbar.Brand>
            <div className="flex md:order-2 gap-2">
                <LocaleSwitcher/>
                <DarkThemeToggle iconDark={Sun} iconLight={Moon}/>
                <Dropdown
                    arrowIcon={false}
                    inline
                    label={
                        <Avatar alt="User settings" img="https://flowbite.com/docs/images/people/profile-picture-5.jpg" rounded/>
                    }
                >
                    <Dropdown.Header>
                        <span className="block text-sm">Bonnie Green</span>
                        <span className="block truncate text-sm font-medium">name@flowbite.com</span>
                    </Dropdown.Header>
                    <Dropdown.Item>Dashboard</Dropdown.Item>
                    <Dropdown.Item>Settings</Dropdown.Item>
                    <Dropdown.Item>Earnings</Dropdown.Item>
                    <Dropdown.Divider/>
                    <Dropdown.Item>Sign out</Dropdown.Item>
                </Dropdown>
                <Navbar.Toggle barIcon={DotsThreeVertical}></Navbar.Toggle>
            </div>
            <Navbar.Collapse>
                <Navbar.Link href="#" active>
                    Home
                </Navbar.Link>
                <Navbar.Link href="#">About</Navbar.Link>
                <Navbar.Link href="#">Services</Navbar.Link>
                <Navbar.Link href="#">Pricing</Navbar.Link>
                <Navbar.Link href="#">Contact</Navbar.Link>
            </Navbar.Collapse>
        </Navbar>
        /*<nav
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
                        <li><LocaleSwitcher/></li>
                        <li><DarkThemeToggle/></li>
                    </ul>
                </div>
            </div>
        </nav>*/
    )
}