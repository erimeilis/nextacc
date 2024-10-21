export default function Toggle({
                                   leftLabel,
                                   rightLabel,
                                   checked,
                                   handleToggle
                               }) {
    return (
        <div className="inline-flex items-center gap-2">
            <label htmlFor="switch-component-on" className="text-sm cursor-pointer">{leftLabel}</label>

            <div className="relative inline-block w-11 h-5">
                <input id="switch-component-on" type="checkbox"
                       className="peer appearance-none w-11 h-5
                       bg-slate-400 dark:bg-indigo-950 rounded-full
                       checked:bg-slate-400 dark:checked:bg-indigo-950 cursor-pointer"
                       onClick={handleToggle} defaultChecked={checked}
                />
                <label htmlFor="switch-component-on"
                       className="absolute top-0 left-0 w-5 h-5 bg-white dark:bg-indigo-300 rounded-full
                       border border-slate-400 dark:border-indigo-900 shadow-sm transition-transform duration-300
                       peer-checked:translate-x-6 peer-checked:border-slate-400 dark:peer-checked:border-indigo-900 cursor-pointer"
                >
                </label>
            </div>

            <label htmlFor="switch-component-on" className="text-sm cursor-pointer">{rightLabel}</label>
        </div>
    )
}