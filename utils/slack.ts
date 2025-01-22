'use server'
import axios, {AxiosError} from 'axios'

export async function slack(text: string): Promise<boolean> {
    const webhookURL = process.env.SLACK_WEBHOOK as string
    return axios.post(
        webhookURL,
        JSON.stringify({text: text}),
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }
    )
        .then((res) => {
            return res.status === 200
        }).catch((err: AxiosError) => {
            console.log('slackAlert error: ', err.message)
            return false
        })
}