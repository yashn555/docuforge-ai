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
      
      if (!session) {
        console.log(chalk.red('[GENERATE] Session not found'));
        return res.status(404).json({ error: 'Session not found' });
      }

      if (!session.templateModel) {
        console.log(chalk.red('[GENERATE] No template model found'));
        return res.status(404).json({ 
          error: 'No template found. Please upload and parse a template first.' 
        });
      }

      // Get sections to generate from request body (from section selection page)
      let sectionsToGenerate = req.body.sectionsToGenerate || [];
      
      // Get user input and add context
      const userInput = {
        ...req.body.userInput,
        context: req.body.userInput?.context || 'The project involves developing a software system',
        selectedSections: sectionsToGenerate,
        documentType: session.templateModel.documentType || 'Project Report',
        templateStructure: session.templateModel.structure || {}
      };

      const options = req.body.options || {};

      console.log(chalk.gray(`[GENERATE] Sections to generate: ${sectionsToGenerate.join(', ') || 'None specified'}`));
      console.log(chalk.gray(`[GENERATE] User input:`, userInput));

      // If no sections provided, use defaults
      if (sectionsToGenerate.length === 0) {
        console.log(chalk.yellow('[GENERATE] No sections specified, using defaults'));
        sectionsToGenerate = ['abstract', 'introduction', 'objectives', 'methodology', 'conclusion'];
        console.log(chalk.gray(`[GENERATE] Default sections: ${sectionsToGenerate.join(', ')}`));
      }

      // Check AI availability
      const aiStatus = await AIService.getAIAvailability();
      console.log(chalk.gray(`[GENERATE] AI Status: ${aiStatus.available ? '✅ Available' : '❌ Not available'}`));

      if (!aiStatus.available) {
        console.log(chalk.yellow('[GENERATE] AI not available, using fallback generation'));
      }

      // Generate document with sections
      console.log(chalk.blue(`[GENERATE] Starting generation for ${sectionsToGenerate.length} sections...`));
      
      const result = await AIService.generateDocument({
        userInput: {
          ...userInput,
          documentType: session.templateModel.documentType || 'Report',
          context: userInput.context || 'The project involves developing a software system',
          technologies: userInput.technologies || 'Modern technologies'
        },
        sectionsToGenerate: sectionsToGenerate,
        options: {
          useAI: options.useAI !== false && aiStatus.available,
          useFallback: options.useFallback !== false,
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 2048,
          regenerateMode: options.regenerateMode || false
        }
      });

      console.log(chalk.green(`[GENERATE] ✅ Generation complete!`));
      console.log(chalk.gray(`   Total Sections: ${result.totalSections}`));
      console.log(chalk.gray(`   AI Generated: ${result.aiGenerated}`));
      console.log(chalk.gray(`   Fallback Generated: ${result.fallbackGenerated}`));
      console.log(chalk.gray(`   Total Time: ${Math.round(result.totalTime / 1000)}s`));

      // Log each section generated
      Object.entries(result.sections).forEach(([key, section]) => {
        console.log(chalk.gray(`   - ${key}: ${section.generatedBy} (${section.processingTime ? Math.round(section.processingTime / 1000) + 's' : 'N/A'})`));
      });

      // Store generated content in session
      sessionService.updateSession(sessionId, {
        generatedDocument: {
          sections: result.sections,
          totalSections: result.totalSections,
          aiGenerated: result.aiGenerated,
          fallbackGenerated: result.fallbackGenerated,
          totalTime: result.totalTime,
          success: result.success,
          errors: result.errors || []
        }
      });

      console.log(chalk.green('[GENERATE] ✅ Document stored in session'));

      res.status(200).json({
        success: true,
        result: {
          sections: result.sections,
          totalSections: result.totalSections,
          aiGenerated: result.aiGenerated,
          fallbackGenerated: result.fallbackGenerated,
          totalTime: result.totalTime,
          success: result.success,
          errors: result.errors || [],
          documentTitle: userInput.title || 'Generated Document',
          documentType: userInput.documentType || 'Project Report',
          generatedAt: new Date().toISOString()
        },
        sessionId: sessionId,
        aiStatus: aiStatus
      });

    } catch (error) {
      console.error(chalk.red('[GENERATE] ❌ Error:'), error);
      console.error(chalk.red(`[GENERATE] Stack: ${error instanceof Error ? error.stack : 'No stack trace'}`));
      res.status(500).json({
        error: 'Failed to generate document',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
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
        console.log(chalk.red('[GENERATE] No template found'));
        return res.status(404).json({ 
          error: 'No template found' 
        });
      }

      // Check AI availability
      const aiStatus = await AIService.getAIAvailability();
      console.log(chalk.gray(`[GENERATE] AI Status: ${aiStatus.available ? '✅ Available' : '❌ Not available'}`));

      // Generate single section with context from existing document
      const existingSections = session.generatedDocument?.sections || {};
      const context = {
        ...userInput,
        documentType: session.templateModel.documentType,
        existingContent: existingSections,
        sectionToRegenerate: sectionType
      };

      console.log(chalk.gray(`[GENERATE] Regenerating with context:`, context));

      const result = await AIService.generateDocument({
        userInput: context,
        sectionsToGenerate: [sectionType],
        options: {
          useAI: aiStatus.available,
          useFallback: true,
          temperature: 0.7,
          maxTokens: 2048,
          regenerateMode: true
        }
      });

      const sectionContent = result.sections[sectionType];

      if (!sectionContent) {
        console.log(chalk.red(`[GENERATE] Section "${sectionType}" not generated`));
        return res.status(404).json({
          error: `Section "${sectionType}" not generated`
        });
      }

      // Update session with new section content
      const currentDoc = session.generatedDocument || { 
        sections: {}, 
        totalSections: 0, 
        aiGenerated: 0, 
        fallbackGenerated: 0, 
        totalTime: 0, 
        success: false, 
        errors: [] 
      };
      currentDoc.sections[sectionType] = sectionContent;
      
      sessionService.updateSession(sessionId, {
        generatedDocument: currentDoc
      });

      console.log(chalk.green(`[GENERATE] ✅ Section "${sectionType}" regenerated successfully`));
      console.log(chalk.gray(`   Generated By: ${sectionContent.generatedBy}`));
      console.log(chalk.gray(`   Processing Time: ${sectionContent.processingTime ? Math.round(sectionContent.processingTime / 1000) + 's' : 'N/A'}`));

      res.status(200).json({
        success: true,
        sectionType: sectionType,
        content: sectionContent,
        generatedBy: sectionContent.generatedBy,
        modelUsed: sectionContent.modelUsed,
        processingTime: sectionContent.processingTime,
        sessionId: sessionId
      });

    } catch (error) {
      console.error(chalk.red('[GENERATE] ❌ Regeneration error:'), error);
      console.error(chalk.red(`[GENERATE] Stack: ${error instanceof Error ? error.stack : 'No stack trace'}`));
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
        console.log(chalk.yellow('[GENERATE] Session not found'));
        return res.status(404).json({ error: 'Session not found' });
      }

      const aiStatus = await AIService.getAIAvailability();
      
      const sectionsGenerated = session.generatedDocument 
        ? Object.keys(session.generatedDocument.sections || {}) 
        : [];
      
      console.log(chalk.gray(`[GENERATE] Status check: ${sectionsGenerated.length} sections generated`));

      res.status(200).json({
        success: true,
        sessionId: sessionId,
        hasTemplate: !!session.templateModel,
        hasGeneratedDoc: !!session.generatedDocument,
        generatedDoc: session.generatedDocument || null,
        aiStatus: aiStatus,
        sectionsGenerated: sectionsGenerated,
        sectionCount: sectionsGenerated.length
      });

    } catch (error) {
      console.error(chalk.red('[GENERATE] ❌ Status error:'), error);
      res.status(500).json({
        error: 'Failed to get generation status'
      });
    }
  }

  // New method: Generate specific sections only
  async generateSelectedSections(req: Request, res: Response) {
    console.log(chalk.blue('[GENERATE] Received selected sections generation request'));
    
    try {
      const sessionId = (req as any).sessionId;
      const { sections, userInput } = req.body;

      if (!sections || !Array.isArray(sections) || sections.length === 0) {
        console.log(chalk.yellow('[GENERATE] No sections provided'));
        return res.status(400).json({
          error: 'Please select at least one section to generate'
        });
      }

      console.log(chalk.gray(`[GENERATE] Generating ${sections.length} selected sections: ${sections.join(', ')}`));

      // Call the main generate method with the selected sections
      req.body.sectionsToGenerate = sections;
      req.body.userInput = userInput || req.body.userInput || {};
      
      return this.generateDocument(req, res);

    } catch (error) {
      console.error(chalk.red('[GENERATE] ❌ Selected sections error:'), error);
      res.status(500).json({
        error: 'Failed to generate selected sections',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // New method: Get available section types based on template
  async getAvailableSections(req: Request, res: Response) {
    console.log(chalk.blue('[GENERATE] Getting available sections'));
    
    try {
      const sessionId = (req as any).sessionId;
      const session = sessionService.getSession(sessionId);
      
      if (!session || !session.templateModel) {
        console.log(chalk.yellow('[GENERATE] No template found'));
        return res.status(404).json({
          error: 'No template found. Please upload a template first.'
        });
      }

      // Get sections from template model or use defaults
      const templateSections = session.templateModel.sections || [];
      const availableSections = templateSections.length > 0 
        ? templateSections 
        : ['abstract', 'introduction', 'objectives', 'methodology', 'results', 'discussion', 'conclusion'];

      console.log(chalk.gray(`[GENERATE] Found ${availableSections.length} available sections`));

      res.status(200).json({
        success: true,
        sections: availableSections.map((section: string) => ({
          id: section,
          title: section.charAt(0).toUpperCase() + section.slice(1),
          key: section,
          description: `Generate ${section} section`,
          enabled: true
        })),
        documentType: session.templateModel.documentType || 'Project Report',
        totalSections: availableSections.length
      });

    } catch (error) {
      console.error(chalk.red('[GENERATE] ❌ Available sections error:'), error);
      res.status(500).json({
        error: 'Failed to get available sections',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // New method: Get generation progress
  async getGenerationProgress(req: Request, res: Response) {
    console.log(chalk.blue('[GENERATE] Received progress request'));
    
    try {
      const sessionId = (req as any).sessionId;
      const session = sessionService.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const generatedDoc = session.generatedDocument;
      const totalSections = generatedDoc?.totalSections || 0;
      const completedSections = generatedDoc ? Object.keys(generatedDoc.sections || {}).length : 0;
      
      const progress = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

      res.status(200).json({
        success: true,
        progress: progress,
        completedSections: completedSections,
        totalSections: totalSections,
        isComplete: generatedDoc?.success || false,
        hasErrors: (generatedDoc?.errors || []).length > 0
      });

    } catch (error) {
      console.error(chalk.red('[GENERATE] ❌ Progress error:'), error);
      res.status(500).json({
        error: 'Failed to get generation progress'
      });
    }
  }
}

export default new GenerateController();