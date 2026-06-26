import { Router } from 'express';
import { upload } from '../middleware/fileUpload.middleware.js';
import uploadController from '../controllers/upload.controller.js';

const router = Router();

router.post('/template', 
  upload.single('template'),
  uploadController.uploadTemplate.bind(uploadController)
);

router.get('/status', 
  uploadController.getUploadStatus.bind(uploadController)
);

export default router;