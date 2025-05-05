'use client'
import styled from 'styled-components'

export const DEFAULT_WAI_ARIA_ATTRIBUTE = {
    'aria-busy': true,
    role: 'progressbar',
}

export const SvgWrapper = styled.div<{ $visible: boolean }>`
    display: ${props => (props.$visible ? 'flex' : 'none')};
`

export default function Loader({
                                   height = 80,
                                   width = 48,
                                   radius = 4,
                                   color,
                                   ariaLabel = 'three-dots-loading',
                                   wrapperClass = 'flex w-full justify-center transition duration-300 ease',
                                   visible = true,
                               }: {
    height?: number
    width?: number
    radius?: number
    color?: string
    ariaLabel?: string
    wrapperClass?: string
    visible?: boolean
}) {
    return (
        <SvgWrapper
            $visible={visible}
            className={wrapperClass}
            data-testid="three-dots-loading"
            aria-label={ariaLabel}
            {...DEFAULT_WAI_ARIA_ATTRIBUTE}
        >
            <svg
                width={width}
                height={height}
                viewBox="0 0 120 30"
                xmlns="http://www.w3.org/2000/svg"
                fill={color || "hsl(var(--primary))"}
                data-testid="three-dots-svg"
            >
                <circle cx="15" cy="15" r={Number(radius) + 6}>
                    <animate
                        attributeName="r"
                        from="15"
                        to="15"
                        begin="0s"
                        dur="0.8s"
                        values="15;9;15"
                        calcMode="linear"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="fill-opacity"
                        from="1"
                        to="1"
                        begin="0s"
                        dur="0.8s"
                        values="1;.5;1"
                        calcMode="linear"
                        repeatCount="indefinite"
                    />
                </circle>
                <circle
                    cx="60"
                    cy="15"
                    r={radius}
                    attributeName="fill-opacity"
                    from="1"
                    to="0.3"
                >
                    <animate
                        attributeName="r"
                        from="9"
                        to="9"
                        begin="0s"
                        dur="0.8s"
                        values="9;15;9"
                        calcMode="linear"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="fill-opacity"
                        from="0.5"
                        to="0.5"
                        begin="0s"
                        dur="0.8s"
                        values=".5;1;.5"
                        calcMode="linear"
                        repeatCount="indefinite"
                    />
                </circle>
                <circle cx="105" cy="15" r={Number(radius) + 6}>
                    <animate
                        attributeName="r"
                        from="15"
                        to="15"
                        begin="0s"
                        dur="0.8s"
                        values="15;9;15"
                        calcMode="linear"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="fill-opacity"
                        from="1"
                        to="1"
                        begin="0s"
                        dur="0.8s"
                        values="1;.5;1"
                        calcMode="linear"
                        repeatCount="indefinite"
                    />
                </circle>
            </svg>
        </SvgWrapper>
    )
}
