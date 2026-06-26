import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import sessionService from '../services/session.service.js';

export const sessionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  let sessionId = req.headers['x-session-id'] as string;
  
  if (!sessionId || !sessionService.getSession(sessionId)) {
    sessionId = uuidv4();
    sessionService.createSession(sessionId);
    // In a real app, set cookie here
    // res.cookie('sessionId', sessionId, { maxAge: 3600000, httpOnly: true });
  }
  
  (req as any).sessionId = sessionId;
  res.setHeader('X-Session-Id', sessionId);
  next();
};