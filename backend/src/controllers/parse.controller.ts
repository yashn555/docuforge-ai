import { Request, Response } from 'express';
import TemplateParserService from '../services/template-parser/template-parser.service.js';
import sessionService from '../services/session.service.js';
import chalk from 'chalk';

// Define progress type
interface ParseProgress {
  step: string;
  progress: number;
  message: string;
  details?: any;
}

export class ParseController {
  async parseTemplate(req: Request, res: Response) {
    console.log(chalk.blue('[PARSE] Received parse request'));
    
    try {
      const sessionId = (req as any).sessionId;
      console.log(chalk.gray(`[PARSE] Session ID: ${sessionId}`));
      
      const session = sessionService.getSession(sessionId);
      
      if (!session || !session.templateFile) {
        console.log(chalk.red('[PARSE] No template found in session'));
        return res.status(404).json({ 
          error: 'No template found for this session. Please upload a template first.' 
        });
      }
      
      const { path: filePath, originalName } = session.templateFile;
      console.log(chalk.gray(`[PARSE] File: ${originalName}`));
      console.log(chalk.gray(`[PARSE] Path: ${filePath}`));

      // Set up SSE for progress
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.flushHeaders();

      // Send initial progress
      const initialProgress = { 
        step: 'start', 
        progress: 0, 
        message: 'Starting template analysis...' 
      };
      res.write(`data: ${JSON.stringify(initialProgress)}\n\n`);
      console.log(chalk.cyan('[PARSE] SSE connection established'));

      // Use the imported service directly (assuming it's a singleton)
      const parser = TemplateParserService;
      
      // Register progress callback with proper type
      parser.onProgress((progress: ParseProgress) => {
        try {
          res.write(`data: ${JSON.stringify(progress)}\n\n`);
          // flushHeaders is already called, and we don't need flush for SSE
          // The data will be sent immediately with write
        } catch (err) {
          console.error(chalk.red('[PARSE] Failed to send progress:'), err);
        }
      });

      try {
        // Parse the template
        console.log(chalk.yellow('[PARSE] Starting parsing...'));
        const parseResult = await parser.parseTemplate(filePath, originalName);
        
        // Store template model in session
        sessionService.updateSession(sessionId, {
          templateModel: parseResult.templateModel
        });
        
        console.log(chalk.green('[PARSE] Parsing complete! Sending result...'));
        
        // Send final result
        const finalResult = {
          step: 'complete',
          progress: 100,
          message: '✅ Parsing complete!',
          result: parseResult
        };
        res.write(`data: ${JSON.stringify(finalResult)}\n\n`);
        res.end();
        console.log(chalk.green('[PARSE] Response sent successfully'));
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(chalk.red('[PARSE] Parse error:'), errorMsg);
        
        const errorResult = {
          step: 'error',
          progress: 0,
          message: `❌ Error: ${errorMsg}`,
          error: errorMsg
        };
        res.write(`data: ${JSON.stringify(errorResult)}\n\n`);
        res.end();
      }
      
    } catch (error) {
      console.error(chalk.red('[PARSE] Controller error:'), error);
      // If SSE isn't set up yet, send JSON error
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Failed to parse template',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      } else {
        const errorResult = {
          step: 'error',
          progress: 0,
          message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.write(`data: ${JSON.stringify(errorResult)}\n\n`);
        res.end();
      }
    }
  }
  
  async getParseStatus(req: Request, res: Response) {
    console.log(chalk.blue('[PARSE] Received status request'));
    
    try {
      const sessionId = (req as any).sessionId;
      console.log(chalk.gray(`[PARSE] Session ID: ${sessionId}`));
      
      const session = sessionService.getSession(sessionId);
      
      if (!session) {
        console.log(chalk.red('[PARSE] Session not found'));
        return res.status(404).json({ error: 'Session not found' });
      }
      
      if (!session.templateModel) {
        console.log(chalk.yellow('[PARSE] No template model found'));
        return res.status(404).json({ 
          error: 'Template not parsed yet. Please parse the template first.' 
        });
      }
      
      const templateModel = session.templateModel;
      console.log(chalk.green('[PARSE] Returning template model'));
      
      res.status(200).json({
        success: true,
        templateModel: templateModel,
        summary: {
          documentType: templateModel.documentType,
          documentTypeLabel: this.getDocumentTypeLabel(templateModel.documentType),
          sectionCount: templateModel.sectionCount,
          wordCount: templateModel.wordCount,
          pageCount: templateModel.pageCount,
          hasPlaceholders: templateModel.placeholders.length > 0,
          placeholderCount: templateModel.placeholders.length,
          hasTitlePage: templateModel.hasTitlePage,
          hasCertificate: templateModel.hasCertificate,
          hasSignature: templateModel.hasSignature,
          hasDeclaration: templateModel.hasDeclaration,
          hasAcknowledgement: templateModel.hasAcknowledgement,
          confidence: templateModel.confidence,
          warnings: templateModel.warnings || [],
          errors: templateModel.errors || []
        }
      });
      
    } catch (error) {
      console.error(chalk.red('[PARSE] Status error:'), error);
      res.status(500).json({
        error: 'Failed to get parse status'
      });
    }
  }
  
  private getDocumentTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'project_report': 'Project Report',
      'internship_report': 'Internship Report',
      'office_report': 'Office Report',
      'certificate': 'Certificate',
      'thesis': 'Thesis',
      'assignment': 'Assignment',
      'letter': 'Letter',
      'proposal': 'Proposal',
      'unknown': 'Unknown Document Type'
    };
    return labels[type] || 'Unknown';
  }
}

export default new ParseController();