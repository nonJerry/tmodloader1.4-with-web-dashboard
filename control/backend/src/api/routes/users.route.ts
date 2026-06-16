
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { getCurrentUser } from '../controllers/users.controller.js';

const usersRouter = Router();

usersRouter.get('/me', authMiddleware, getCurrentUser);

export default usersRouter;