import { Request, Response } from 'express';
import { extendAllowedInactivity, getStatus } from '../../services/status.service.js';

export function handleStatus(req: Request, res: Response) {
    res.send(getStatus());
}


export function handleExtend(req: Request, res: Response) {
    extendAllowedInactivity();
    res.sendStatus(200);
}