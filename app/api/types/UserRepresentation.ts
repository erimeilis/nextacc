export interface UserRepresentation {
    id?: string
    username?: string
    firstName?: string
    lastName?: string
    email: string //it's optional, as for docs, but in practic nothing works without it
    emailVerified?: boolean
    enabled?: boolean //maybe use it to ban or suspend users'
    attributes?: object
    //api has more options, but we don't use them yet, nor I understand what they are
}