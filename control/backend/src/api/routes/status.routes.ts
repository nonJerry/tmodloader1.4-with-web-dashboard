import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { handleStatus, handleExtend } from '../controllers/status.controller.js';

const statusRouter = Router();

statusRouter.get('/status', authMiddleware, handleStatus);
statusRouter.get('/extend', authMiddleware, handleExtend);

export default statusRouter;