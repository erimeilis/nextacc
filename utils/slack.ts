'use server'

export async function slack(text: string): Promise<boolean> {
    const webhookURL = process.env.SLACK_WEBHOOK as string

    try {
        const response = await fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({text: text})
        })

        return response.status === 200
    } catch (err) {
        console.log('slackAlert error: ', err instanceof Error ? err.message : String(err))
        return false
    }
}
