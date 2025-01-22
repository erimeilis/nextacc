export default function getSlug(name: string) {
    return name.toLowerCase()
        .split(',')[0]
        .replace(/[^a-z\s]/gi, '')
        .trim()
        .replace(/\s/gi, '-')
}