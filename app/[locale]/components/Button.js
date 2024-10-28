const fixedButtonClass = 'flex relative w-fit cursor-pointer transition-all ease-in-out ' +
    'before:transition-[width] before:ease-in-out before:duration-300 before:absolute ' +
    'before:bg-black dark:before:bg-white ' +
    'before:origin-center before:h-[1px] before:w-0 hover:before:w-[50%] before:bottom-0 before:left-[50%] ' +
    'after:transition-[width] after:ease-in-out after:duration-300 after:absolute ' +
    'after:bg-black dark:after:bg-white ' +
    'after:origin-center after:h-[1px] after:w-0 hover:after:w-[50%] after:bottom-0 after:right-[50%] ' +
    'text-slate-800 dark:text-slate-300 ' +
    'hover:text-slate-950 dark:hover:text-slate-100 antialiased hover:subpixel-antialiased ' +
    'px-1 pt-2 '

export default function Button({
                                   type = 'button',
                                   className = '',
                                   onClick,
                                   children
                               }) {
    return (
        <button
            type={type}
            className={fixedButtonClass + className}
            onClick={onClick}
        >
            {children}
        </button>
    )
}