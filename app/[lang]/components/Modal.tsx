import * as Ariakit from "@ariakit/react"
import React, {useState} from "react"

export default function Modal({
                                  btnTitle,
                                  btnClassName,
                                  customClass,
                                  children
                              }: {
    btnTitle: string
    btnClassName: string
    customClass: string
    children: React.ReactNode
}) {
    const [open, setOpen] = useState(false)
    const fixedModalClass = "fixed flex m-auto items-center justify-center px-4 py-8 " +
        "sm:w-3/5 md:w-1/2 lg:w-2/5 max-w-2xl z-50 overflow-auto h-fit inset-1 " +
        "rounded-md bg-white dark:bg-slate-900 shadow-sm "
    return (
        <>
            <Ariakit.Button
                type="button"
                onClick={() => setOpen(true)}
                className={btnClassName}
            >
                {btnTitle}
            </Ariakit.Button>
            <Ariakit.Dialog
                open={open}
                onClose={() => setOpen(false)}
                backdrop={<div className="backdrop"/>}
                className={fixedModalClass + customClass}
            >
                <div className="w-full flex flex-col">
                    {children}
                </div>
            </Ariakit.Dialog>
        </>
    )
}