import type { Request, Response } from 'express'
import { API_URL } from "../../config/constants.js"

function handleCommand(command: string) {
    return async (req: Request, res: Response) => {
        try {
            const response = await fetch(
                `${API_URL}/${command}`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'text/plain',
                    },
                    body: ''
                }
            )

            if (!response.ok) {
                return res
                    .status(response.status)
                    .json({ error: `Upstream returned ${response.status}` })
            }

            res.json({
                success: true,
                message: `${command} command sent`,
            })
        } catch (err) {
            console.error(err)

            res.status(500).json({
                success: false,
                message: `Failed to send ${command}`,
            })
        }
    }
}

export default handleCommand