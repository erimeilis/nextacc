import {Label, ToggleSwitch} from 'flowbite-react'

export default function Toggle({
                                   leftLabel,
                                   rightLabel,
                                   checked,
                                   handleToggle
                               }) {
    return (
        <div className="inline-flex items-center gap-2">
            <Label htmlFor="switch-component-on" className="text-sm cursor-pointer">{leftLabel}</Label>
            <div className="flex">
                <ToggleSwitch id="switch-component-on" onClick={handleToggle} checked={checked}/>
            </div>
            <Label htmlFor="switch-component-on" className="text-sm cursor-pointer">{rightLabel}</Label>
        </div>
    )
}