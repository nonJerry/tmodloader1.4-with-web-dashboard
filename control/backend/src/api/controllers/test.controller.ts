import type { Request, Response } from 'express'
import { extendAllowedInactivity, getDefaultTimeout, getLastSeen, setInactivityTimeout, setLastSeen } from '../../services/status.service.js';

export function handleForceInactivityStop (req: Request, res: Response) {
        try {
            forceInactivity()
            res.status(200).json({
                success: true,
                message: `Forced inactivity stop`,
            });
        } catch (err) {
            console.error(err);

            res.status(500).json({
                success: false,
                message: `Failed to force inactivity stop`,
            });
        }
}

function forceInactivity() {
    setLastSeen(getLastSeen() - Date.now())
}

export function handleAdvanceTime(req: Request, res: Response) {
        try {
            console.log(`Advancing time by ${req.body.amount} ms`);
            advanceTime(req.body.amount)
            res.status(200).json({
                success: true,
                message: `Time advanced by ${req.body.amount} ms`,
            });
        } catch (err) {
            console.error(err);

            res.status(500).json({
                success: false,
                message: `Failed to advance time`,
            });
        }
}

function advanceTime(amount: number) {
    setLastSeen(getLastSeen() - amount)
}

export function handleSetTimeout(req: Request, res: Response) {
        try {
            setTimeout(req.body.timeout)
            res.status(200).json({
                success: true,
                message: `Inactivity timeout set to ${req.body.timeout} ms`,
            });
        } catch (err) {
            console.error(err);

            res.status(500).json({
                success: false,
                message: `Failed to set inactivity timeout`,
            });
        }
}

function setTimeout(timeout: number) {
    setInactivityTimeout(timeout)
}

export function handleReset(req: Request, res: Response)  {
        try {
            reset()
            res.status(200).json({
                success: true,
                message: `Inactivity reset`,
            });
        } catch (err) {
            console.error(err);

            res.status(500).json({
                success: false,
                message: `Failed to reset inactivity`,
            });
        }
}

function reset() {
    extendAllowedInactivity()
    setInactivityTimeout(getDefaultTimeout())
}