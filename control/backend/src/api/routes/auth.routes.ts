import express from 'express'
import { getCurrentUser, handleLogin, handleLogout } from "../controllers/auth.controller.js";


const authRouter = express.Router();

authRouter.post('/login', handleLogin())
authRouter.post('/logout', handleLogout())
authRouter.get('/api/user', getCurrentUser());

export default authRouter;