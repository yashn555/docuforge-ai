import multer from 'multer';
import { Request } from 'express';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Import Multer types
import { FileFilterCallback } from 'multer';

// Ensure upload directory exists
const uploadDir = join(process.cwd(), 'uploads', 'temp');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = file.originalname.split('.').pop();
    cb(null, `${uniqueId}.${ext}`);
  }
});

// Fix: Use multer's File type instead of Express.Multer.File
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  // Also check extension
  const ext = file.originalname.split('.').pop()?.toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) || ext === 'docx') {
    cb(null, true);
  } else {
    cb(new Error('UNSUPPORTED_FILE_TYPE') as any);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  }
});