'use client'

import { useSession as useNextAuthSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useClientStore } from '@/stores/useClientStore'

/**
 * Custom hook that wraps next-auth's useSession hook and adds error handling
 * to flush the clientStore when an auth error occurs.
 * 
 * @param options The options to pass to the useSession hook
 * @returns The session data from next-auth's useSession hook
 */
export function useAuthSession(options?: Parameters<typeof useNextAuthSession>[0]) {
  const session = useNextAuthSession(options)
  const resetClientStore = useClientStore(state => state.reset)

  useEffect(() => {
    // If there's an error with the session, flush the clientStore
    if (session.status === 'unauthenticated') {
      console.log('User not authenticated, flushing clientStore')
      resetClientStore()
    }
  }, [session.status, resetClientStore])

  return session
}
