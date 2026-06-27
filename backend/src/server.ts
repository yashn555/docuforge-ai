import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

import uploadRoutes from './routes/upload.routes.js';
import sessionRoutes from './routes/session.routes.js';
import parseRoutes from './routes/parse.routes.js';
import generateRoutes from './routes/generate.routes.js';
import composeRoutes from './routes/compose.routes.js';
import { sessionMiddleware } from './middleware/session.middleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload directories exist
const dirs = ['./uploads/temp', './uploads/composed'];
for (const dir of dirs) {
  const fullPath = join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(chalk.gray(`📁 Created directory: ${dir}`));
  }
}

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(chalk.gray(`[${req.method}] ${req.url}`));
  next();
});

// Routes - Register all routes
console.log(chalk.yellow('\n📋 Registering routes...'));
app.use('/api/upload', uploadRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/parse', parseRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/compose', composeRoutes);
console.log(chalk.green('✅ All routes registered'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    sessionId: (req as any).sessionId
  });
});

// Test compose route
app.get('/api/compose-test', (req, res) => {
  res.json({ message: 'Compose test route is working!' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(chalk.red(`[ERROR] ${err.message}`));
  console.error(err.stack);
  
  if (err.code === 'FILE_TOO_LARGE') {
    return res.status(413).json({ 
      error: 'File too large. Maximum size is 10MB.' 
    });
  }
  
  if (err.code === 'UNSUPPORTED_FILE_TYPE') {
    return res.status(415).json({ 
      error: 'Unsupported file type. Please upload a DOCX file.' 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(chalk.blue(`\n🚀 Server running on http://localhost:${PORT}`));
  console.log(chalk.green(`📁 Upload directory: ${join(__dirname, '../uploads/temp')}`));
  console.log(chalk.green(`📁 Composed directory: ${join(__dirname, '../uploads/composed')}`));
  console.log(chalk.yellow(`\n📋 Available Routes:`));
  console.log(chalk.gray(`  POST /api/upload/template`));
  console.log(chalk.gray(`  GET  /api/upload/status`));
  console.log(chalk.gray(`  POST /api/parse/template`));
  console.log(chalk.gray(`  GET  /api/parse/status`));
  console.log(chalk.gray(`  POST /api/generate/document`));
  console.log(chalk.gray(`  POST /api/generate/section/:sectionType`));
  console.log(chalk.gray(`  GET  /api/generate/status`));
  console.log(chalk.gray(`  POST /api/compose/document`));
  console.log(chalk.gray(`  GET  /api/compose/download`));
  console.log(chalk.gray(`  GET  /api/compose/status`));
  console.log(chalk.gray(`  GET  /api/session/info`));
  console.log(chalk.gray(`  GET  /api/health`));
  console.log(chalk.gray(`  GET  /api/compose-test\n`));
});