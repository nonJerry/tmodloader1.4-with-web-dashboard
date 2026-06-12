import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import handleStatus from '../controllers/status.controller.js';

const statusRouter = Router();

statusRouter.get('/status', authMiddleware, handleStatus);

export default statusRouter;