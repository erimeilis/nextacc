'use client'
import {Label} from '@/components/ui/primitives/Label'
import {ToggleSwitch} from '@/components/ui/primitives/Switch'
import React from 'react'

interface ToggleProps {
    leftLabel: string;
    rightLabel: string;
    checked: boolean;
    onToggleAction: (checked: boolean) => void; // Renamed from onToggle to onToggleAction
}

export default function Toggle({
                                   leftLabel,
                                   rightLabel,
                                   checked,
                                   onToggleAction
                               }: ToggleProps) {
    return (
        <div className="inline-flex items-center gap-2">
            <Label htmlFor="switch-component" className={`text-sm cursor-pointer ${!checked ? 'font-bold' : ''}`}>{leftLabel}</Label>
            <div className="flex">
                <ToggleSwitch
                    id="switch-component"
                    onChange={(e) => {
                        // With our updated ToggleSwitch component, we can now access e.target.checked
                        if (typeof e === 'object' && e !== null && 'target' in e && e.target && 'checked' in e.target) {
                            onToggleAction(e.target.checked as boolean)
                        } else {
                            // Fallback to the previous behavior
                            onToggleAction(!checked)
                        }
                    }}
                    checked={checked}
                />
            </div>
            <Label htmlFor="switch-component" className={`text-sm cursor-pointer ${checked ? 'font-bold' : ''}`}>{rightLabel}</Label>
        </div>
    )
}
