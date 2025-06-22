'use client'
import React from 'react'

interface SliderProps {
    value: number
    onChangeAction: (value: number) => void
    min?: number
    max?: number
    step?: number
    label: string
    disabled?: boolean
}

export const Slider = ({
                           value,
                           onChangeAction,
                           min = 0,
                           max = 60,
                           step = 1,
                           label,
                           disabled = false
                       }: SliderProps) => {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium">{label}</label>
                <span className="text-sm text-muted-foreground">{value}sec</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChangeAction(parseInt(e.target.value))}
                disabled={disabled}
                style={{
                    background: `linear-gradient(to right, hsl(var(--button-to)), hsl(var(--button-from)) ${(value - min) / (max - min) * 100}%, hsl(var(--muted)) ${(value - min) / (max - min) * 100}%)`
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-[hsl(var(--button-from))] [&::-webkit-slider-thumb]:to-[hsl(var(--button-to))] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-r [&::-moz-range-thumb]:from-[hsl(var(--button-from))] [&::-moz-range-thumb]:to-[hsl(var(--button-to))]"
            />
        </div>
    )
}
