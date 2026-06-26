import { Router } from 'express';
import parseController from '../controllers/parse.controller.js';

const router = Router();

// POST /api/parse/template - Parse uploaded template
router.post('/template', parseController.parseTemplate.bind(parseController));

// GET /api/parse/status - Get parsing status
router.get('/status', parseController.getParseStatus.bind(parseController));

// GET /api/parse/test - Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Parse routes are working!' });
});

export default router;