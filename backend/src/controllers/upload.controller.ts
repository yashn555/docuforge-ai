import { Request, Response } from 'express';
import { readFileSync } from 'fs';
import mammoth from 'mammoth';
import { join } from 'path';
import sessionService from '../services/session.service.js';

export class UploadController {
  async uploadTemplate(req: Request, res: Response) {
    try {
      const sessionId = (req as any).sessionId;
      const file = (req as any).file;
      
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Store file info in session
      sessionService.updateSession(sessionId, {
        templateFile: {
          originalName: file.originalname,
          path: file.path,
          size: file.size
        }
      });

      // Basic file validation - verify it's a valid DOCX
      const fileBuffer = readFileSync(file.path);
      
      // Parse with mammoth to verify DOCX
      let parsedContent;
      try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        parsedContent = result.value;
      } catch (parseError) {
        return res.status(400).json({ 
          error: 'Invalid DOCX file. Unable to parse content.' 
        });
      }

      // Get basic document info
      const docInfo = {
        fileName: file.originalname,
        fileSize: file.size,
        wordCount: parsedContent.split(/\s+/).length,
        charCount: parsedContent.length,
        hasContent: parsedContent.trim().length > 0
      };

      // Preview first 500 characters
      const contentPreview = parsedContent.slice(0, 500) + 
        (parsedContent.length > 500 ? '...' : '');

      // Store parsed content in session
      sessionService.updateSession(sessionId, {
        templateModel: {
          fileName: file.originalname,
          filePath: file.path,
          size: file.size,
          parsedContent: parsedContent,
          contentPreview: contentPreview,
          wordCount: docInfo.wordCount,
          charCount: docInfo.charCount,
          uploadedAt: new Date().toISOString()
        }
      });

      res.status(200).json({
        success: true,
        sessionId: sessionId,
        file: {
          name: file.originalname,
          size: file.size,
          path: file.path
        },
        preview: {
          content: contentPreview,
          wordCount: docInfo.wordCount,
          charCount: docInfo.charCount
        },
        message: 'Template uploaded successfully'
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        error: 'Failed to upload template',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getUploadStatus(req: Request, res: Response) {
    try {
      const sessionId = (req as any).sessionId;
      const session = sessionService.getSession(sessionId);
      
      if (!session || !session.templateFile) {
        return res.status(404).json({ 
          error: 'No template found for this session' 
        });
      }

      res.status(200).json({
        success: true,
        file: session.templateFile,
        templateModel: session.templateModel
      });

    } catch (error) {
      res.status(500).json({
        error: 'Failed to get upload status'
      });
    }
  }
}

export default new UploadController();