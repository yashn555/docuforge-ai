import { v4 as uuidv4 } from 'uuid';

interface SessionData {
  id: string;
  createdAt: number;
  lastAccessed: number;
  templateFile?: {
    originalName: string;
    path: string;
    size: number;
  };
  templateModel?: any;
  userInput?: any;
  generatedDocument?: any;
}

class SessionService {
  private sessions: Map<string, SessionData> = new Map();
  private TTL = 3600000; // 1 hour

  createSession(id?: string): SessionData {
    const sessionId = id || uuidv4();
    const session: SessionData = {
      id: sessionId,
      createdAt: Date.now(),
      lastAccessed: Date.now()
    };
    this.sessions.set(sessionId, session);
    
    // Auto cleanup after TTL
    setTimeout(() => {
      this.cleanup();
    }, this.TTL);
    
    return session;
  }

  getSession(id: string): SessionData | undefined {
    const session = this.sessions.get(id);
    if (session) {
      session.lastAccessed = Date.now();
    }
    return session;
  }

  updateSession(id: string, data: Partial<SessionData>): boolean {
    const session = this.sessions.get(id);
    if (!session) return false;
    
    Object.assign(session, data);
    session.lastAccessed = Date.now();
    return true;
  }

  deleteSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (now - session.lastAccessed > this.TTL) {
        this.sessions.delete(id);
      }
    }
  }

  getAllSessions(): SessionData[] {
    return Array.from(this.sessions.values());
  }
}

export default new SessionService();