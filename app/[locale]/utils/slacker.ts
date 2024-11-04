interface CreateAlertOptions {
    name: string
    text: string
}

export async function slackAlert({name, text}: CreateAlertOptions): Promise<void> {
    const slackWebhookUrl = process.env.SLACK_WEBHOOK

    const body = JSON.stringify({text: `${name} created a new alert: ${text}`})

    // Node 18+ is required to use the built-in `fetch` function
    const response = await fetch(slackWebhookUrl!, {
        method: 'POST',
        body,
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        let responseText = ''

        try {
            responseText = await response.text()
        } catch {
        }

        throw new Error(
            `Posting to Slack returned a ${response.status} status code. ` + `The response was:\n\n${responseText}`,
        )
    }
}