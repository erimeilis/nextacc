import {ReactNode, useEffect} from 'react'
import {useSession} from 'next-auth/react'
import usePersistState from '@/usePersistState'
import {v4 as uuidv4} from 'uuid'

export default function AnonymousSessionProvider({ //todo rename or remove it cos we only set persistentId here
                                                     children
                                                 }: {
    children: ReactNode
}) {
    const {data: session, status} = useSession()
    const [persistentId, setPersistentId] = usePersistState<string>('', 'persistentId')

    useEffect(() => {
        console.log(status)
        if (persistentId === '') setPersistentId(uuidv4())
        //if (status === 'unauthenticated') {
            // login as anonymous without redirect to prevent callbackUrl parameter accumulation
        //    (async () => {
        //        await signIn('anonymous', { redirect: false })
        //    })()
        //}
    }, [persistentId, session, setPersistentId, status])

    return (
        <>
            {children}
        </>
    )
}
