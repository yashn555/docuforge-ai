import { Request, Response } from 'express';
import fs from 'fs';
import sessionService from '../services/session.service.js';
import DocxComposer from '../services/composition-engine/docx-composer.js';
import chalk from 'chalk';

export class ComposeController {
  async composeDocument(req: Request, res: Response) {
    console.log(chalk.blue('[COMPOSE] Received compose request'));
    
    try {
      const sessionId = (req as any).sessionId;
      const session = sessionService.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ 
          error: 'Session not found' 
        });
      }

      if (!session.templateFile) {
        return res.status(404).json({ 
          error: 'No template found. Please upload a template first.' 
        });
      }

      const generatedDoc = session.generatedDocument;

      if (!generatedDoc || !generatedDoc.sections) {
        return res.status(404).json({
          error: 'No generated content found. Please generate the document first.'
        });
      }

      const { path: templatePath } = session.templateFile;
      const sections = generatedDoc.sections;

      console.log(chalk.gray(`[COMPOSE] Template: ${templatePath}`));
      console.log(chalk.gray(`[COMPOSE] Sections: ${Object.keys(sections).join(', ')}`));

      // Compose the document
      const result = await DocxComposer.composeDocument(
        templatePath,
        sections,
        session.userInput || {}
      );

      // Store the composed file in session
      if (result.success) {
        sessionService.updateSession(sessionId, {
          composedFile: {
            path: result.outputPath,
            fileName: result.outputFileName,
            sectionsMapped: result.sectionsMapped,
            totalSections: result.totalSections
          }
        });
        console.log(chalk.green(`[COMPOSE] Composition successful: ${result.outputFileName}`));
      } else {
        console.log(chalk.red(`[COMPOSE] Composition failed: ${result.errors.join(', ')}`));
      }

      res.status(200).json({
        success: result.success,
        outputPath: result.outputPath,
        outputFileName: result.outputFileName,
        sectionsMapped: result.sectionsMapped,
        totalSections: result.totalSections,
        errors: result.errors
      });

    } catch (error) {
      console.error(chalk.red('[COMPOSE] Error:'), error);
      res.status(500).json({
        error: 'Failed to compose document',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async downloadComposed(req: Request, res: Response) {
    console.log(chalk.blue('[COMPOSE] Received download request'));
    
    try {
      const sessionId = (req as any).sessionId;
      const session = sessionService.getSession(sessionId);
      
      if (!session || !session.composedFile) {
        return res.status(404).json({
          error: 'No composed file found. Please compose the document first.'
        });
      }

      const { path: filePath, fileName } = session.composedFile;

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          error: 'Composed file not found on server.'
        });
      }

      console.log(chalk.green(`[COMPOSE] Downloading: ${fileName}`));
      
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error(chalk.red('[COMPOSE] Download error:'), err);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to download file' });
          }
        } else {
          console.log(chalk.green(`[COMPOSE] Download complete: ${fileName}`));
        }
      });

    } catch (error) {
      console.error(chalk.red('[COMPOSE] Download error:'), error);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Failed to download composed document'
        });
      }
    }
  }

  async getCompositionStatus(req: Request, res: Response) {
    console.log(chalk.blue('[COMPOSE] Received status request'));
    
    try {
      const sessionId = (req as any).sessionId;
      const session = sessionService.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.status(200).json({
        success: true,
        hasTemplate: !!session.templateFile,
        hasGeneratedContent: !!session.generatedDocument,
        hasComposedFile: !!session.composedFile,
        composedFile: session.composedFile || null,
        templateModel: session.templateModel || null
      });

    } catch (error) {
      console.error(chalk.red('[COMPOSE] Status error:'), error);
      res.status(500).json({
        error: 'Failed to get composition status'
      });
    }
  }
}

export default new ComposeController();