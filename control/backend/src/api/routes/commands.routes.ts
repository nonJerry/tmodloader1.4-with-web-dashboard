import express from 'express'
import { authMiddleware } from "../middlewares/auth.middleware.js";
import handleCommand from '../controllers/commands.controller.js'


const commandsRouter = express.Router();

const commands = [
    'start',
    'stop',
    'dawn',
    'noon',
    'dusk',
    'midnight',
    'save',
]

commands.forEach((command) => {
    commandsRouter.post(`/${command}`, authMiddleware, handleCommand(command));
});

export default commandsRouter;