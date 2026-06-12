import { Request, Response } from 'express';
import { getStatus } from '../../services/status.service.js';

export function handleStatus(req: Request, res: Response) {
    res.send(getStatus());
}

export default handleStatus