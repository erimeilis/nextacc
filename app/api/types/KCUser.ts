export interface KCUser {
    id: string,
    email: string,
    username?: string,
    phone?: string,
    access_token: string,
    refresh_token: string,
    maxAge?: number
}