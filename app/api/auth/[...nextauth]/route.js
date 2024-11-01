import NextAuth from 'next-auth'
import {authOptions} from './authOptions'

const handler = async (req, context) => {
    return await NextAuth(req, context, authOptions(req.clone()))
}

export {handler as GET, handler as POST}