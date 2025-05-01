import {ReactNode, useEffect} from 'react'
import {signIn, useSession} from 'next-auth/react'
import usePersistState from '@/usePersistState'
import {v4 as uuidv4} from 'uuid'

export default function AnonymousSessionProvider({
                                                     children
                                                 }: {
    children: ReactNode
}) {
    const {data: session, status} = useSession()
    const [persistentId, setPersistentId] = usePersistState<string>('', 'persistentId')

    useEffect(() => {
        console.log(status)
        if (status === 'unauthenticated') {
            // login as anonymous without redirect to prevent callbackUrl parameter accumulation
            signIn('anonymous', { redirect: false })
                .then(() => {
                    if (persistentId === '') setPersistentId(uuidv4())
                })
        }
    }, [persistentId, session, setPersistentId, status])

    return (
        <>
            {children}
        </>
    )
}
