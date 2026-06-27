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

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Ensure upload directories exist - Using absolute paths for Render compatibility
const uploadDir = join(process.cwd(), 'uploads', 'temp');
const composedDir = join(process.cwd(), 'uploads', 'composed');
const generatedDir = join(process.cwd(), 'uploads', 'generated');

// Create directories if they don't exist
[uploadDir, composedDir, generatedDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(chalk.green(`📁 Created directory: ${dir}`));
  }
});

// Also create relative directories for local development
const relDirs = ['./uploads/temp', './uploads/composed', './uploads/generated'];
for (const dir of relDirs) {
  const fullPath = join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(chalk.gray(`📁 Created directory: ${dir}`));
  }
}

// Middleware
const corsOrigins = process.env.CORS_ORIGIN 
  ? [process.env.CORS_ORIGIN, 'http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174']
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(sessionMiddleware);

// Log all requests for debugging (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(chalk.gray(`[${req.method}] ${req.url}`));
    next();
  });
}

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
    sessionId: (req as any).sessionId,
    environment: process.env.NODE_ENV || 'development',
    directories: {
      upload: uploadDir,
      composed: composedDir,
      generated: generatedDir
    }
  });
});

// Test compose route
app.get('/api/compose-test', (req, res) => {
  res.json({ 
    message: 'Compose test route is working!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(chalk.red(`[ERROR] ${err.message}`));
  if (err.stack && process.env.NODE_ENV !== 'production') {
    console.error(chalk.red(err.stack));
  }
  
  // Handle specific error types
  if (err.code === 'FILE_TOO_LARGE') {
    return res.status(413).json({ 
      error: 'File too large. Maximum size is 10MB.',
      timestamp: new Date().toISOString()
    });
  }
  
  if (err.code === 'UNSUPPORTED_FILE_TYPE') {
    return res.status(415).json({ 
      error: 'Unsupported file type. Please upload a DOCX file.',
      timestamp: new Date().toISOString()
    });
  }
  
  // Handle session errors
  if (err.message && err.message.includes('session')) {
    return res.status(400).json({
      error: 'Session error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
  
  // Default error response
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(chalk.blue(`\n🚀 Server running on http://localhost:${PORT}`));
  console.log(chalk.green(`📁 Upload directory: ${uploadDir}`));
  console.log(chalk.green(`📁 Composed directory: ${composedDir}`));
  console.log(chalk.green(`📁 Generated directory: ${generatedDir}`));
  console.log(chalk.yellow(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`));
  console.log(chalk.yellow(`🔗 CORS Origins: ${corsOrigins.join(', ')}`));
  console.log(chalk.yellow(`\n📋 Available Routes:`));
  console.log(chalk.gray(`  ─── Upload ───`));
  console.log(chalk.gray(`  POST /api/upload/template       - Upload DOCX template`));
  console.log(chalk.gray(`  GET  /api/upload/status         - Check upload status`));
  console.log(chalk.gray(`  ─── Parse ───`));
  console.log(chalk.gray(`  POST /api/parse/template        - Parse template structure`));
  console.log(chalk.gray(`  GET  /api/parse/status          - Check parse status`));
  console.log(chalk.gray(`  ─── Generate ───`));
  console.log(chalk.gray(`  POST /api/generate/document     - Generate full document`));
  console.log(chalk.gray(`  POST /api/generate/section/:type - Generate specific section`));
  console.log(chalk.gray(`  GET  /api/generate/status       - Check generation status`));
  console.log(chalk.gray(`  ─── Compose ───`));
  console.log(chalk.gray(`  POST /api/compose/document      - Compose document from template`));
  console.log(chalk.gray(`  GET  /api/compose/download      - Download composed document`));
  console.log(chalk.gray(`  GET  /api/compose/status        - Check compose status`));
  console.log(chalk.gray(`  ─── Session ───`));
  console.log(chalk.gray(`  GET  /api/session/info          - Get session info`));
  console.log(chalk.gray(`  ─── System ───`));
  console.log(chalk.gray(`  GET  /api/health                - Health check`));
  console.log(chalk.gray(`  GET  /api/compose-test          - Test compose route`));
  console.log(chalk.green(`\n✨ Server is ready to accept requests`));
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log(chalk.yellow('\n⚠️  Received shutdown signal, closing server...'));
  server.close(() => {
    console.log(chalk.green('✅ Server closed gracefully'));
    process.exit(0);
  });

  // Force close after 10 seconds if not closed
  setTimeout(() => {
    console.log(chalk.red('❌ Force closing server after timeout'));
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('uncaughtException', (error) => {
  console.error(chalk.red('💥 Uncaught Exception:'), error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('💥 Unhandled Rejection:'), reason);
});

export default app;