import { Router } from 'express';
import generateController from '../controllers/generate.controller.js';

const router = Router();

// POST /api/generate/document - Generate full document
router.post('/document', generateController.generateDocument.bind(generateController));

// POST /api/generate/section/:sectionType - Regenerate specific section
router.post('/section/:sectionType', generateController.regenerateSection.bind(generateController));

// GET /api/generate/status - Get generation status
router.get('/status', generateController.getGenerationStatus.bind(generateController));

export default router;