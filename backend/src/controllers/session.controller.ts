import { Request, Response } from 'express';
import sessionService from '../services/session.service.js';

export class SessionController {
  async getSessionInfo(req: Request, res: Response) {
    try {
      const sessionId = (req as any).sessionId;
      const session = sessionService.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.status(200).json({
        success: true,
        session: {
          id: session.id,
          createdAt: session.createdAt,
          lastAccessed: session.lastAccessed,
          hasTemplate: !!session.templateFile,
          hasTemplateModel: !!session.templateModel,
          hasUserInput: !!session.userInput,
          hasGeneratedDoc: !!session.generatedDocument
        }
      });

    } catch (error) {
      res.status(500).json({
        error: 'Failed to get session info'
      });
    }
  }
}

export default new SessionController();