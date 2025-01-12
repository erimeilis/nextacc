export type MoneyTransaction = {
    datetime: Date,
    amount: number,
    operation: string,
    description: string,
    reseller: boolean
}