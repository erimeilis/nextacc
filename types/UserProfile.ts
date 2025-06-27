export type UserProfile = {
    id: number
    email: string
    email_confirm: boolean
    phone: number
    firstname: string
    lastname: string
    company: string
    address: string
    country: string
    low_balance_notification: boolean
    low_balance_edge: number
    subscribe_news: boolean
    balance: number
}
