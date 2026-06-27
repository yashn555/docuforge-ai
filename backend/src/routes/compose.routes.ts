import { Router } from 'express';
import composeController from '../controllers/compose.controller.js';

const router = Router();

// POST /api/compose/document - Compose the document
router.post('/document', composeController.composeDocument.bind(composeController));

// GET /api/compose/download - Download the composed document
router.get('/download', composeController.downloadComposed.bind(composeController));

// GET /api/compose/status - Get composition status
router.get('/status', composeController.getCompositionStatus.bind(composeController));

export default router;