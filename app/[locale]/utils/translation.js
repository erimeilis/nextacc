import deepmerge from 'deepmerge'

export async function getFallback({locale}) {
    const docMessages = (await import(`@/messages/${locale}.json`)).default
    const defaultDocMessages = (await import(`@/messages/en.json`)).default
    const d = deepmerge(defaultDocMessages, docMessages)
    console.log(d)
    return d
}