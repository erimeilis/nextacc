'use client'
import { Label } from '@/components/ui/label'
import { ToggleSwitch } from '@/components/ui/switch'

export default function Toggle({
                                   leftLabel,
                                   rightLabel,
                                   checked,
                                   handleToggle
                               }: {
    leftLabel: string
    rightLabel: string
    checked: boolean
    handleToggle: (event: boolean) => void
}) {
    return (
        <div className="inline-flex items-center gap-2">
            <Label htmlFor="switch-component-on" className="text-sm cursor-pointer">{leftLabel}</Label>
            <div className="flex">
                <ToggleSwitch
                    id="switch-component-on"
                    onChange={handleToggle}
                    checked={checked}
                />
            </div>
            <Label htmlFor="switch-component-on" className="text-sm cursor-pointer">{rightLabel}</Label>
        </div>
    )
}
