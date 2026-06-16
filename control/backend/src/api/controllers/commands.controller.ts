import type { Request, Response } from 'express'
import { API_URL } from "../../config/constants.js"

export function handleCommand(command: string) {
    return async (req: Request, res: Response) => {
        try {
            const result = await sendCommand(command);
            res.json(result);
        } catch (err) {
            console.error(err);

            res.status(500).json({
                success: false,
                message: `Failed to send ${command}`,
            });
        }
    };
}


export async function sendCommand(command: string) {
    const response = await fetch(`${API_URL}/${command}`, {
        method: 'POST',
        headers: {
            Accept: 'text/plain',
        },
        body: '',
    });

    if (!response.ok) {
        throw new Error(`Upstream returned ${response.status}`);
    }

    return {
        success: true,
        message: `${command} command sent`,
    };
}