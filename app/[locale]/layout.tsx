//'use server'
import '@/app/[locale]/globals.css'
import {AuthProvider} from '@/AuthProvider'
import React from 'react'
import {routing} from '@/i18n/routing'
import {notFound} from 'next/navigation'
import {getMessages} from 'next-intl/server'
import {NextIntlClientProvider} from 'next-intl'
import {CustomFlowbiteTheme, Flowbite, ThemeModeScript} from 'flowbite-react'
import Nav from '@/components/service/Nav'
import { Metadata } from 'next'
import SWRProvider from '@/components/SWRProvider'

export const metadata: Metadata = {
  title: 'NextAcc',
}

export default async function RootLayout(
    props: {
        dashboard: React.ReactNode,
        offers: React.ReactNode,
        params: Promise<{ locale: string }>
    }
) {
    const params = await props.params

    const {
        locale
    } = params

    const {
        dashboard,
        offers
    } = props

    if (!routing.locales.includes(locale as never)) {
        notFound()
    }
    const messages = await getMessages()

    const indigoOrangeTheme: CustomFlowbiteTheme = {
        navbar: {
            root: {
                base: 'w-full px-4 py-2 mx-auto bg-orange-500 dark:bg-indigo-950 bg-opacity-90 sticky top-0 shadow lg:px-8 lg:py-3 backdrop-blur-lg backdrop-saturate-150 z-[9999]',
                rounded: {
                    on: 'rounded',
                    off: ''
                },
            },
            link: {
                base: 'block py-2 pl-3 pr-4 md:p-0',
                active: {
                    'on': 'text-gray-100 dark:text-gray-300',
                    'off': 'text-gray-300 hover:text-gray-100 hover:bg-orange-600 dark:hover:bg-indigo-900'
                },
                disabled: {
                    'on': 'text-gray-400 hover:cursor-not-allowed dark:text-gray-600',
                    'off': ''
                }
            },
            toggle: {
                'base': 'inline-flex items-center rounded-lg p-2 text-sm text-gray-100 hover:bg-orange-400 dark:hover:bg-indigo-900 focus:outline-none md:hidden',
                'icon': 'h-6 w-6 shrink-0'
            }
        },
        darkThemeToggle: {
            root: {
                base: 'rounded-lg p-2.5 text-sm text-gray-300 hover:text-gray-50 focus:outline-none dark:text-gray-200 dark:hover:text-white' +
                    ' dark:focus:ring-gray-700',
                //icon: ''
            }
        },
        dropdown: {
            floating: {
                arrow: {
                    base: 'absolute z-10 h-2 w-2 rotate-45',
                    style: {
                        'dark': 'bg-gray-900 dark:bg-indigo-900',
                        'light': 'bg-gray-100',
                        'auto': 'bg-gray-100 dark:bg-indigo-900'
                    },
                    placement: '-4px'
                },
                base: 'z-10 w-fit divide-y divide-gray-200 rounded shadow focus:outline-none',
                item: {
                    container: '',
                    base: 'flex w-full cursor-pointer items-center justify-start px-4 py-2 text-sm text-gray-700 hover:bg-orange-100 focus:bg-orange-100 focus:outline-none ' +
                        'dark:text-slate-300 dark:hover:bg-indigo-800 dark:hover:text-slate-200 dark:focus:bg-indigo-800 dark:focus:text-white',
                    icon: 'mr-2 h-4 w-4'
                },
                style: {
                    'dark': 'text-slate-200 bg-indigo-900',
                    'light': 'border border-gray-200 bg-white text-gray-900',
                    'auto': 'border border-gray-200 bg-white text-gray-900 dark:border-none dark:bg-indigo-900 dark:text-slate-200'
                },
            },
        },
        listGroup: {
            root: {
                base: 'list-none flex flex-col sm:flex-row items-center w-full text-sm font-medium text-gray-900 bg-gray-100 rounded-md ' +
                    'dark:text-slate-400 dark:bg-indigo-900 border-0 border-gray-200 dark:border-indigo-600'
            },
            item: {
                base: 'w-full border-gray-300 dark:border-indigo-800 ' +
                    '[&>*]:first:rounded-t-md [&>*]:last:rounded-b-md [&>*]:last:border-b-0 ' +
                    'sm:[&>*]:first:rounded-tr-none sm:[&>*]:last:rounded-bl-none ' +
                    'sm:border-b-0 sm:[&>*]:first:rounded-l-md sm:[&>*]:last:rounded-r-md sm:[&>*]:last:border-r-0 ',
                link: {
                    base: 'w-full text-center px-4 py-2 text-sm font-medium border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-indigo-600',
                    active: {
                        off: 'hover:bg-orange-100 hover:text-black focus:text-black focus:outline-none focus:ring-1 focus:ring-gray-300' +
                            ' dark:hover:bg-indigo-800 dark:hover:text-slate-200 dark:focus:text-gray-100 dark:focus:ring-indigo-500',
                        on: 'text-gray-100 bg-orange-500 dark:bg-indigo-950'
                    }
                }
            }
        },
        select: {
            base: 'border-none bg-transparent dark:bg-transparent w-full p-0 m-0',
            addon: 'border-none bg-transparent dark:bg-transparent w-full p-0 m-0',
            field: {
                base: 'border-none bg-transparent dark:bg-transparent w-full p-0 m-0',
                icon: {
                    base: 'border-none',
                    svg: 'border-none',
                },
                select: {
                    base: 'border-none bg-transparent dark:bg-transparent w-full p-0 m-0',
                }
            }
        },
        radio: {
            root: {
                base: 'h-4 w-4 cursor-pointer border border-sone-600 bg-stone-400 focus:ring-1 focus:ring-orange-500 text-orange-500 focus:bg-white' +
                    'dark:border-slate-500 dark:bg-slate-700 dark:focus:bg-indigo-800 dark:focus:ring-indigo-600 dark:text-indigo-600 dark:focus:bg-black'
            },
        },
        toggleSwitch: {
            root: {
                base: 'group flex rounded-lg focus:outline-none',
            },
            toggle: {
                base: 'relative rounded-full border after:absolute after:rounded-full after:bg-gray-100 after:transition-all group-focus:ring-1 group-focus:ring-gray-300' +
                    'dark:after:bg-slate-900 dark:group-focus:ring-indigo-800',
                checked: {
                    on: 'after:translate-x-full after:border-gray-200 rtl:after:-translate-x-full',
                    off: 'border-gray-200 bg-gray-400 dark:border-indigo-950 dark:bg-indigo-700',
                    color: {
                        blue: 'border-gray-200 bg-gray-400 dark:border-indigo-800 dark:bg-indigo-700',
                    }
                }
            }
        },
        textInput: {
            base: 'flex',
            field: {
                base: 'relative w-full rounded-full m-0',
                icon: {
                    base: 'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3',
                    svg: 'h-4 w-4 text-gray-500 dark:text-gray-400'
                },
                rightIcon: {
                    base: 'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3',
                    svg: 'h-4 w-4 text-gray-500 dark:text-gray-400'
                },
                input: {
                    base: 'block w-full border disabled:cursor-not-allowed disabled:opacity-50 rounded-none',
                    'sizes': {
                        'sm': 'pt-2 pb-1 px-1 text-sm',
                        'md': 'p-1.5',
                        'lg': 'p-4'
                    },
                    colors: {
                        gray: 'rounded-lg border-gray-300 bg-gray-50 text-gray-900 focus:border-orange-300 focus:ring-orange-400 ' +
                            'dark:border-indigo-800 dark:bg-slate-900 dark:text-gray-200' +
                            ' dark:placeholder-gray-400 dark:focus:border-indigo-700 dark:focus:ring-indigo-600',
                        info: 'rounded-none border-x-0 border-t-0 border-b focus:border-b focus:ring-0 bg-transparent m-0 ' +
                            'border-gray-400 border-opacity-30 dark:border-indigo-800 dark:border-opacity-40 focus:border-orange-300 dark:focus:border-indigo-700',
                        failure: 'border-red-500 bg-red-50 text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-red-500 dark:border-red-400 dark:bg-red-100 dark:focus:border-red-500 dark:focus:ring-red-500',
                        warning: 'border-yellow-500 bg-yellow-50 text-yellow-900 placeholder-yellow-700 focus:border-yellow-500 focus:ring-yellow-500 dark:border-yellow-400 dark:bg-yellow-100 dark:focus:border-yellow-500 dark:focus:ring-yellow-500',
                        success: 'border-green-500 bg-green-50 text-green-900 placeholder-green-700 focus:border-green-500 focus:ring-green-500 dark:border-green-400 dark:bg-green-100 dark:focus:border-green-500 dark:focus:ring-green-500'
                    },
                    withAddon: {
                        'on': '',
                        'off': ''
                    },
                }
            }
        },
        checkbox: {
            'root': {
                'base': 'h-4 w-4 rounded border border-gray-300 bg-gray-100 focus:ring-2 dark:border-gray-600 dark:bg-gray-700',
                'color': {
                    'default': 'text-orange-500 focus:ring-orange-400 dark:text-indigo-600 dark:ring-offset-indigo-800 dark:focus:ring-indigo-600',
                }
            }
        },
        card: {
            root: {
                base: 'flex rounded-md w-full border border-gray-200 bg-gray-100 drop-shadow text-gray-800 ' +
                    'dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-200',
                children: 'flex h-full flex-col justify-center gap-4 p-6',
                horizontal: {
                    'off': 'flex-col',
                    'on': 'flex-col md:max-w-xl md:flex-row'
                },
                href: 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }
        },
        tabs: {
            base: 'flex flex-col rounded-md w-full border border-gray-200 bg-gray-100 drop-shadow text-gray-800 ' +
                'dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-200',
            tablist: {
                base: 'flex text-center shadow-none',
                variant: {
                    'default': 'flex-wrap border-b border-gray-200 dark:border-gray-700',
                    'underline': '-mb-px flex-wrap border-b border-gray-200 dark:border-gray-700',
                    'pills': 'flex-wrap space-x-2 text-sm font-medium text-gray-500 dark:text-gray-400',
                    'fullWidth': 'grid w-full grid-flow-col divide-x divide-gray-200 text-sm font-medium dark:divide-indigo-900 dark:text-gray-400'
                },
                tabitem: {
                    base: 'flex items-center justify-center rounded-t-md p-4 text-sm font-medium first:ml-0 focus:outline-none focus:ring-none' +
                        ' disabled:cursor-not-allowed disabled:text-gray-400 disabled:dark:text-gray-500',
                    variant: {
                        default: {
                            base: 'rounded-t-md',
                            active: {
                                'on': 'shadow-none bg-gray-100 text-cyan-600 dark:bg-gray-800 dark:text-cyan-500',
                                'off': 'text-gray-500 hover:bg-gray-50 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                            }
                        },
                        underline: {
                            base: 'rounded-t-lg',
                            active: {
                                on: 'active rounded-t-lg border-b-2 border-cyan-600 text-cyan-600 dark:border-cyan-500 dark:text-cyan-500',
                                off: 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300'
                            }
                        },
                        pills: {
                            base: '',
                            active: {
                                on: 'rounded-lg bg-cyan-600 text-white',
                                off: 'rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white'
                            }
                        },
                        fullWidth: {
                            base: 'ml-0 flex w-full first:ml-0',
                            active: {
                                on: 'active border-b-0 bg-gray-100 p-4 text-gray-900 ' +
                                    'dark:bg-indigo-950 dark:text-white',
                                off: 'shadow-inner shadow-sm bg-white hover:bg-gray-50 hover:text-gray-700 ' +
                                    'dark:bg-indigo-900 dark:hover:bg-indigo-800 dark:hover:text-white'
                            }
                        }
                    },
                    icon: 'mr-2 h-5 w-5'
                }
            },
            tabitemcontainer: {
                base: '',
                variant: {
                    default: '',
                    underline: '',
                    pills: '',
                    fullWidth: ''
                }
            },
            tabpanel: 'h-full justify-center gap-4 p-6'
        },
        label: {
            root: {
                base: 'text-opacity-40 dark:text-opacity-60'
            }
        },
        table: {
            'root': {
                'base': 'w-full text-left text-sm text-gray-500 dark:text-gray-200',
                'shadow': 'absolute left-0 top-0 -z-10 h-full w-full rounded-lg bg-white drop-shadow-md dark:bg-indigo-950',
                'wrapper': 'relative'
            },
            'body': {
                'base': 'group/body',
                'cell': {
                    'base': 'px-3 py-2 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg' +
                        ' group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg'
                }
            },
            'head': {
                'base': 'group/head text-xs text-gray-600 dark:text-gray-400',
                'cell': {
                    'base': 'bg-gray-50 px-3 py-2 group-first/head:first:rounded-tl-lg group-first/head:last:rounded-tr-lg dark:bg-indigo-900'
                }
            },
            'row': {
                'base': 'group/row',
                'hovered': 'hover:bg-gray-50 dark:hover:bg-gray-600',
                'striped': 'odd:bg-white even:bg-gray-50 odd:dark:bg-indigo-900/70 even:dark:bg-indigo-950/70'
            }
        }
    }

    return (
        <html lang={locale} suppressHydrationWarning>
        <head>
            <ThemeModeScript/>
            <title>NextAcc</title>
            <link rel="icon" href="/icon.png" type="image/png" />
        </head>
        <body className="bg-stone-200 dark:bg-slate-900">
        <SWRProvider>
            <AuthProvider>
                <NextIntlClientProvider messages={messages}>
                    <Flowbite theme={{theme: indigoOrangeTheme}}>
                        <Nav/>
                        <main className="flex items-center justify-center px-4 pt-4 pb-96 bg-stone-200 dark:bg-slate-900">
                            <div className="flex flex-col sm:w-full md:w-5/6 lg:w-3/4 max-w-4xl gap-4">
                                {offers}
                                {dashboard}
                            </div>
                        </main>
                    </Flowbite>
                </NextIntlClientProvider>
            </AuthProvider>
        </SWRProvider>
        </body>
        </html>
    )
}
