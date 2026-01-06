import {useSyncExternalStore} from 'react'

/**
 * React 19 approved hook for detecting client-side rendering.
 * Uses useSyncExternalStore to avoid hydration mismatch issues.
 *
 * Returns true on client, false during SSR/hydration.
 */
export function useIsClient(): boolean {
    return useSyncExternalStore(
        // subscribe - noop since this value never changes after mount
        () => () => {},
        // getSnapshot - client value
        () => true,
        // getServerSnapshot - server value
        () => false
    )
}
