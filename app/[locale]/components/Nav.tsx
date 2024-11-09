'use client'
import LocaleSwitcher from '@/app/[locale]/components/LocaleSwitcher'
import logoLight from '@/app/[locale]/icon-light.png'
import logo from '@/app/[locale]/icon.png'
import {DotsThreeVertical, Moon, Sun} from '@phosphor-icons/react'
import {Avatar, DarkThemeToggle, Dropdown, Navbar} from 'flowbite-react'
import {signOut, useSession} from 'next-auth/react'
import {useTranslations} from 'next-intl'
import Image from 'next/image'
import React from 'react'
import {createHash} from 'crypto'
import Link from 'next/link'

export default function Nav() {

    const session = useSession()
    const t = useTranslations('login')

    return (
        <Navbar
            fluid
        >
            <Navbar.Brand as={Link} href="/">
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
                {(session &&
                    session.status === 'authenticated' &&
                    session.data &&
                    session.data.user
                ) ? <Dropdown
                    arrowIcon={false}
                    inline
                    label={
                        <Avatar
                            alt="User settings"
                            img={
                                session.data.user.image ??
                                'https://gravatar.com/avatar/' + createHash('sha256').update(session.data.user.email!.toLowerCase()).digest('hex')
                            }
                            rounded>
                        </Avatar>
                    }
                >
                    <Dropdown.Header>
                        <span className="block text-sm">{session.data.user.name}</span>
                        <span className="block truncate text-sm font-medium">{session.data.user.email}</span>
                    </Dropdown.Header>
                    <Dropdown.Item>Dashboard</Dropdown.Item>
                    <Dropdown.Item>Settings</Dropdown.Item>
                    <Dropdown.Item>Earnings</Dropdown.Item>
                    <Dropdown.Divider/>
                    <Dropdown.Item
                        onClick={() => signOut()}
                    >
                        {t('signout')}
                    </Dropdown.Item>
                </Dropdown> : null}
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
    )
}