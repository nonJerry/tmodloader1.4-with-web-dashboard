import { Router } from 'express';
import { handleForceInactivityStop, handleAdvanceTime, handleReset, handleSetTimeout } from '../controllers/test.controller.js';

const testRouter = Router();

  testRouter.post('/force-inactivity-stop', handleForceInactivityStop)
  testRouter.post('/advance-time', handleAdvanceTime)
  testRouter.post('/setTimeout', handleSetTimeout)
  testRouter.post('/reset',  handleReset)

 export default testRouter;