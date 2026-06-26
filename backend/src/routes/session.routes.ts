import { Router } from 'express';
import sessionController from '../controllers/session.controller.js';

const router = Router();

router.get('/info', sessionController.getSessionInfo.bind(sessionController));

export default router;