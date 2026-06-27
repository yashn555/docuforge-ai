import { Request, Response } from 'express';
import AIService from '../services/ai-service/ai.service.js';
import sessionService from '../services/session.service.js';
import chalk from 'chalk';

export class GenerateController {
  async generateDocument(req: Request, res: Response) {
    console.log(chalk.blue('[GENERATE] Received generation request'));
    
    try {
      const sessionId = (req as any).sessionId;
      console.log(chalk.gray(`[GENERATE] Session ID: ${sessionId}`));
      
      const session = sessionService.getSession(sessionId);
      
      if (!session || !session.templateModel) {
        console.log(chalk.red('[GENERATE] No template model found'));
        return res.status(404).json({ 
          error: 'No template found. Please upload and parse a template first.' 
        });
      }

      const userInput = req.body.userInput || {};
      const sectionsToGenerate = req.body.sectionsToGenerate || ['abstract', 'introduction', 'conclusion'];
      const options = req.body.options || {};

      console.log(chalk.gray(`[GENERATE] Sections: ${sectionsToGenerate.join(', ')}`));
      console.log(chalk.gray(`[GENERATE] User input:`, userInput));

      // Check AI availability
      const aiStatus = await AIService.getAIAvailability();
      console.log(chalk.gray(`[GENERATE] AI Status: ${aiStatus.available ? 'Available' : 'Not available'}`));

      if (!aiStatus.available) {
        console.log(chalk.yellow('[GENERATE] AI not available, using fallback generation'));
      }

      // Generate document
      const result = await AIService.generateDocument({
        userInput: {
          ...userInput,
          documentType: session.templateModel.documentType,
        },
        sectionsToGenerate,
        options: {
          useAI: options.useAI !== false && aiStatus.available,
          useFallback: options.useFallback !== false,
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 2048
        }
      });

      // Store generated content in session
      sessionService.updateSession(sessionId, {
        generatedDocument: {
          result: result,
          sections: result.sections,
          timestamp: new Date().toISOString()
        }
      });

      console.log(chalk.green('[GENERATE] Document generated successfully'));
      console.log(chalk.gray(`   AI: ${result.aiGenerated}, Fallback: ${result.fallbackGenerated}`));

      res.status(200).json({
        success: true,
        result: result,
        sessionId: sessionId,
        aiStatus: aiStatus
      });

    } catch (error) {
      console.error(chalk.red('[GENERATE] Error:'), error);
      res.status(500).json({
        error: 'Failed to generate document',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async regenerateSection(req: Request, res: Response) {
    console.log(chalk.blue('[GENERATE] Received section regeneration request'));
    
    try {
      const sessionId = (req as any).sessionId;
      const { sectionType } = req.params;
      const userInput = req.body.userInput || {};

      console.log(chalk.gray(`[GENERATE] Regenerating section: ${sectionType}`));

      const session = sessionService.getSession(sessionId);
      
      if (!session || !session.templateModel) {
        return res.status(404).json({ 
          error: 'No template found' 
        });
      }

      // Check AI availability
      const aiStatus = await AIService.getAIAvailability();

      // Generate single section using the service
      const result = await AIService.generateDocument({
        userInput: {
          ...userInput,
          documentType: session.templateModel.documentType,
        },
        sectionsToGenerate: [sectionType],
        options: {
          useAI: aiStatus.available,
          useFallback: true,
          temperature: 0.7,
          maxTokens: 2048
        }
      });

      const sectionContent = result.sections[sectionType];

      if (!sectionContent) {
        return res.status(404).json({
          error: `Section "${sectionType}" not generated`
        });
      }

      // Update session with new section content
      const currentDoc = session.generatedDocument || { sections: {} };
      currentDoc.sections[sectionType] = sectionContent;
      
      sessionService.updateSession(sessionId, {
        generatedDocument: currentDoc
      });

      console.log(chalk.green(`[GENERATE] Section "${sectionType}" regenerated`));

      res.status(200).json({
        success: true,
        sectionType: sectionType,
        content: sectionContent,
        generatedBy: sectionContent.generatedBy,
        sessionId: sessionId
      });

    } catch (error) {
      console.error(chalk.red('[GENERATE] Regeneration error:'), error);
      res.status(500).json({
        error: 'Failed to regenerate section',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getGenerationStatus(req: Request, res: Response) {
    console.log(chalk.blue('[GENERATE] Received status request'));
    
    try {
      const sessionId = (req as any).sessionId;
      const session = sessionService.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const aiStatus = await AIService.getAIAvailability();

      res.status(200).json({
        success: true,
        sessionId: sessionId,
        hasTemplate: !!session.templateModel,
        hasGeneratedDoc: !!session.generatedDocument,
        generatedDoc: session.generatedDocument || null,
        aiStatus: aiStatus
      });

    } catch (error) {
      console.error(chalk.red('[GENERATE] Status error:'), error);
      res.status(500).json({
        error: 'Failed to get generation status'
      });
    }
  }
}

export default new GenerateController();